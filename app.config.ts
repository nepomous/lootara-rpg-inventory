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
    versionCode: 5,
    permissions: ["com.google.android.gms.permission.AD_ID"],
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
      "expo-build-properties",
      {
        android: {
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          extraProguardRules: `
# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-dontwarn com.facebook.react.**

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }

# Expo modules
-keep class expo.modules.** { *; }
-keep class expo.** { *; }
-dontwarn expo.**

# RevenueCat
-keep class com.revenuecat.purchases.** { *; }
-dontwarn com.revenuecat.purchases.**

# Google AdMob / UMP
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.android.ump.** { *; }
-dontwarn com.google.android.gms.ads.**

# JSI interop
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}
-keepclassmembers class * implements com.facebook.react.bridge.JavaScriptModule { *; }
-keepclassmembers class * implements com.facebook.react.bridge.NativeModule { *; }

# Keep source info for stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
`,
        },
      },
    ],
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
      // EAS project ID é um identificador público — seguro para commitar.
      // Ref: https://docs.expo.dev/workflow/configuration/#dynamic-configuration-with-appconfigjs
      projectId: "9fc57fda-6a8e-4934-9841-2f99a2ea3b50",
    },
  },
});
