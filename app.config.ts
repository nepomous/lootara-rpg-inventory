import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Lootara - RPG Inventory",
  slug: "lootara-rpg-inventory",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#1a1a2e",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.lootara.rpginventory",
  },
  android: {
    package: "com.lootara.rpginventory",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#1a1a2e",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    config: {
      googleMobileAdsAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID ?? "",
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
        androidAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID ?? "",
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS ?? "",
      },
    ],
  ],
  scheme: "lootara",
  extra: {
    revenueCatApiKeyAndroid: process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID,
    revenueCatApiKeyIos: process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS,
    admobBannerAdUnitId: process.env.EXPO_PUBLIC_ADMOB_BANNER_ID,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
