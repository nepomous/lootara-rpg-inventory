import mobileAds, { TestIds } from "react-native-google-mobile-ads";
import Constants from "expo-constants";

// ---------------------------------------------------------------------------
// Ad Unit IDs
// Em __DEV__ usa os IDs de teste oficiais do Google.
// Em produção lê do app.config.ts (extra), que por sua vez lê do .env.
// ---------------------------------------------------------------------------

function resolveId(prodId: string | undefined, testId: string): string {
  if (__DEV__) return testId;
  return prodId ?? testId; // fallback seguro: nunca string vazia em produção
}

const extra = Constants.expoConfig?.extra as
  | {
      admobBannerHome?: string;
      admobBannerCharacter?: string;
      admobRewarded?: string;
    }
  | undefined;

export const AdUnits = {
  bannerHome: resolveId(extra?.admobBannerHome, TestIds.BANNER),
  bannerCharacter: resolveId(extra?.admobBannerCharacter, TestIds.BANNER),
  rewarded: resolveId(extra?.admobRewarded, TestIds.REWARDED),
} as const;

// ---------------------------------------------------------------------------
// Inicialização
// Deve ser chamado uma única vez durante o boot do app (_layout.tsx).
// ---------------------------------------------------------------------------
export async function initializeAds(): Promise<void> {
  await mobileAds().initialize();
}
