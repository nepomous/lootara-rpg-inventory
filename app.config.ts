import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Lootara",
  slug: "lootara-rpg-inventory",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#1A1C2C",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.lootara.app",
  },
  android: {
    package: "com.lootara.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#1A1C2C",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    config: {
      // SEC-05 [RISCO ACEITO]: App IDs do AdMob são PÚBLICOS por design do Google.
      // Qualquer pessoa com o APK instalado pode extraí-los. O Google não os trata
      // como segredos — a proteção contra abuso é feita server-side pelo AdMob.
      googleMobileAdsAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ?? "",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    "expo-secure-store",
    [
      "react-native-google-mobile-ads",
      {
        // SEC-05 [RISCO ACEITO]: App IDs do AdMob são públicos por design.
        androidAppId:
          process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID ??
          "ca-app-pub-3940256099942544~3347511713",
        iosAppId:
          process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS ??
          "ca-app-pub-3940256099942544~1458002511",
      },
    ],
  ],
  scheme: "lootara",
  extra: {
    // SEC-05 [RISCO ACEITO]: Chaves do RevenueCat são PUBLIC SDK keys por design.
    // A validação real de compras ocorre server-side (Apple/Google) — o SDK key
    // sozinho não permite fraude. Documentação RevenueCat confirma que é seguro
    // incluir no bundle: https://www.revenuecat.com/docs/getting-started/installation
    revenueCatApiKeyAndroid: process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID,
    revenueCatApiKeyIos: process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS,
    // SEC-05 [RISCO ACEITO]: Unit IDs do AdMob são públicos por design do Google.
    admobBannerHome: process.env.EXPO_PUBLIC_ADMOB_BANNER_HOME,
    admobBannerCharacter: process.env.EXPO_PUBLIC_ADMOB_BANNER_CHARACTER,
    admobRewarded: process.env.EXPO_PUBLIC_ADMOB_REWARDED,
    eas: {
      // SEC-05 [CORRETO]: EAS_PROJECT_ID NÃO usa prefixo EXPO_PUBLIC_ —
      // é injetado apenas em build-time e não é embutido no bundle JS.
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
