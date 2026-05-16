import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { usePremiumStore } from "@/store/premiumStore";
import * as SecureStore from "expo-secure-store";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import Constants from "expo-constants";

const SECURE_STORE_KEY = "premium_status";

// ── Inicialização no app load (_layout.tsx) ───────────────────────────────────
// Configura RevenueCat, lê status e salva em SecureStore + Zustand.
export async function initPremium(): Promise<void> {
  try {
    const apiKey = Constants.expoConfig?.extra?.revenueCatApiKeyAndroid ?? "";

    if (!apiKey) {
      const cached = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      usePremiumStore.getState().setIsPremium(cached === "true");
      return;
    }

    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({ apiKey });

    const info = await Purchases.getCustomerInfo();
    const isPremium =
      typeof info.entitlements.active["premium"] !== "undefined";

    await SecureStore.setItemAsync(
      SECURE_STORE_KEY,
      isPremium ? "true" : "false",
    );
    usePremiumStore.getState().setIsPremium(isPremium);
  } catch {
    // Fallback offline: lê do SecureStore
    try {
      const cached = await SecureStore.getItemAsync(SECURE_STORE_KEY);
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
