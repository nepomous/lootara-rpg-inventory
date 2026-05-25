import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { usePremiumStore } from "@/store/premiumStore";
import * as SecureStore from "expo-secure-store";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Constants from "expo-constants";
import { logger } from "@/utils/logger";

const SECURE_STORE_KEY = "premium_status";

// ── Inicialização no app load (_layout.tsx) ───────────────────────────────────
// Configura RevenueCat, lê status e salva em SecureStore + Zustand.
export async function initPremium(): Promise<void> {
  try {
    const apiKey = Constants.expoConfig?.extra?.revenueCatApiKeyAndroid ?? "";

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
      typeof info.entitlements.active["premium"] !== "undefined";

    // SEC-02: WHEN_UNLOCKED_THIS_DEVICE_ONLY impede exportação via backup ADB/iCloud
    // e garante que o valor só é lido com o dispositivo desbloqueado
    await SecureStore.setItemAsync(
      SECURE_STORE_KEY,
      isPremium ? "true" : "false",
      { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
    usePremiumStore.getState().setIsPremium(isPremium);
  } catch {
    // Fallback offline: lê do SecureStore
    try {
      const cached = await SecureStore.getItemAsync(SECURE_STORE_KEY, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      usePremiumStore.getState().setIsPremium(cached === "true");
    } catch {
      // Silencia — padrão é não-premium
    }
  }
}

// ── Hook para uso em componentes ──────────────────────────────────────────────
export function usePremium() {
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
        typeof customerInfo.entitlements.active["premium"] !== "undefined";
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
        typeof customerInfo.entitlements.active["premium"] !== "undefined";
      await updateStatus(active);
      Alert.alert(
        active ? "Compra restaurada! 🎉" : "Nenhuma compra encontrada",
        active
          ? "Anúncios removidos."
          : "Não encontramos nenhuma compra ativa nesta conta.",
      );
    } catch {
      Alert.alert(
        "Erro",
        "Não foi possível restaurar compras. Verifique sua conexão.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [updateStatus]);

  return {
    isPremium,
    purchasePremium,
    restorePurchases,
    isLoading,
    offerPrice,
  };
}
