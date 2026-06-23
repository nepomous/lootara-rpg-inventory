import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import { usePremiumStore } from "@/store/premiumStore";
import * as SecureStore from "expo-secure-store";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
} from "react-native-purchases";
import Constants from "expo-constants";
import { logger } from "@/utils/logger";

const SECURE_STORE_KEY = "premium_status";
const ENTITLEMENT_ID = "Lootara Premium";

// ── Helpers compartilhados ────────────────────────────────────────────────────
async function persistPremiumStatus(info: CustomerInfo): Promise<void> {
  const isActive =
    typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
  await SecureStore.setItemAsync(
    SECURE_STORE_KEY,
    isActive ? "true" : "false",
    { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
  );
  usePremiumStore.getState().setIsPremium(isActive);
}

// ── Listener reativo (registrar após initPremium) ─────────────────────────────
// Retorna função de cleanup — chamar no unmount/cleanup do AppInitializer.
export function setupPremiumListener(): () => void {
  async function onCustomerInfoUpdated(info: CustomerInfo) {
    try {
      await persistPremiumStatus(info);
    } catch {
      // Silencia — listener best-effort
    }
  }

  Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdated);

  return () => {
    Purchases.removeCustomerInfoUpdateListener(onCustomerInfoUpdated);
  };
}

// ── Inicialização no app load (_layout.tsx) ───────────────────────────────────
// Configura RevenueCat, lê status e salva em SecureStore + Zustand.
export async function initPremium(): Promise<void> {
  // Flag de teste: EXPO_PUBLIC_FORCE_PREMIUM=true no .env
  // Só funciona em builds de desenvolvimento (__DEV__) — nunca em produção.
  if (__DEV__ && process.env.EXPO_PUBLIC_FORCE_PREMIUM === "true") {
    logger.warn("[DEV] FORCE_PREMIUM ativo — simulando conta premium");
    usePremiumStore.getState().setIsPremium(true);
    return;
  }

  try {
    const apiKey =
      Platform.OS === "ios"
        ? (Constants.expoConfig?.extra?.revenueCatApiKeyIos ?? "")
        : (Constants.expoConfig?.extra?.revenueCatApiKeyAndroid ?? "");

    if (!apiKey) {
      // SEC-02: WHEN_UNLOCKED_THIS_DEVICE_ONLY impede exportação via backup ADB/iCloud
      const cached = await SecureStore.getItemAsync(SECURE_STORE_KEY, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      usePremiumStore.getState().setIsPremium(cached === "true");
      return;
    }

    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });

    // SEC-06: Aviso em modo de desenvolvimento — sem bloqueio.
    // __DEV__ é false em builds de produção, portanto este log nunca aparece
    // no APK/IPA publicado. Não bloqueamos o app em dispositivos rooteados porque
    // o RevenueCat valida compras server-side (Apple/Google): mesmo que o
    // SecureStore local seja manipulado, getCustomerInfo() no próximo boot
    // sobrescreve o estado com a verdade vinda do servidor.
    if (__DEV__) {
      logger.warn(
        "Development build — ensure RevenueCat is configured for production before releasing",
      );
    }

    const info = await Purchases.getCustomerInfo();
    const isPremium =
      typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";

    // SEC-02: WHEN_UNLOCKED_THIS_DEVICE_ONLY impede exportação via backup ADB/iCloud
    // e garante que o valor só é lido com o dispositivo desbloqueado
    await SecureStore.setItemAsync(
      SECURE_STORE_KEY,
      isPremium ? "true" : "false",
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
    usePremiumStore.getState().setIsPremium(isPremium);
  } catch {
    // Fallback offline: lê do SecureStore.
    // Se cached === null (instalação nova), não chamamos setIsPremium —
    // o valor padrão do Zustand (false) já serve como estado provisório;
    // o setupPremiumListener atualizará quando a rede voltar.
    try {
      const cached = await SecureStore.getItemAsync(SECURE_STORE_KEY, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      if (cached !== null) {
        usePremiumStore.getState().setIsPremium(cached === "true");
      }
    } catch {
      // Silencia — padrão é não-premium provisório
    }
  }
}

// ── Hook para uso em componentes ──────────────────────────────────────────────
export function usePremium() {
  const { t } = useTranslation();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const setIsPremium = usePremiumStore((s) => s.setIsPremium);
  const [isLoading, setIsLoading] = useState(false);
  const [offerPrice, setOfferPrice] = useState<string | null>(null);

  // Carrega preço do RevenueCat
  useEffect(() => {
    Purchases.getOfferings()
      .then((offerings) => {
        const pkg = offerings.current?.availablePackages[0];
        if (pkg?.product.priceString) setOfferPrice(pkg.product.priceString);
      })
      .catch(() => {});
  }, []);

  const updateStatus = useCallback(
    async (value: boolean) => {
      await SecureStore.setItemAsync(
        SECURE_STORE_KEY,
        value ? "true" : "false",
        { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
      );
      setIsPremium(value);
    },
    [setIsPremium],
  );

  const purchasePremium = useCallback(async () => {
    setIsLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages[0];
      if (!pkg) {
        Alert.alert("Indisponível", "Nenhum pacote de compra encontrado.");
        return;
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const active =
        typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
      await updateStatus(active);
      if (active) {
        Alert.alert("Sucesso! 🎉", "Anúncios removidos. Obrigado pelo apoio!");
      }
    } catch (e: unknown) {
      // code 1 = PURCHASE_CANCELLED_ERROR — não mostrar alerta
      if ((e as { code?: number })?.code !== 1) {
        Alert.alert(
          "Erro",
          "Não foi possível completar a compra. Tente novamente.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [updateStatus]);

  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const active =
        typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
      await updateStatus(active);
      Alert.alert(
        active
          ? t("settings.restore_success_title")
          : t("settings.restore_none_title"),
        active
          ? t("settings.restore_success_message")
          : t("settings.restore_none_message"),
      );
    } catch {
      Alert.alert(
        t("settings.restore_error_title"),
        t("settings.restore_error_message"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [updateStatus, t]);

  return {
    isPremium,
    purchasePremium,
    restorePurchases,
    isLoading,
    offerPrice,
  };
}
