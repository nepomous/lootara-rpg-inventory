import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import Constants from "expo-constants";
import { usePremiumStore } from "@/store/premiumStore";
import { Colors } from "@/constants/theme";

// Em desenvolvimento usa ID de teste; em produção usa o ID do .env
const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : ((Constants.expoConfig?.extra?.admobBannerAdUnitId as string | undefined) ??
    "");

export function AdBanner() {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [failed, setFailed] = useState(false);

  if (isPremium || failed || !adUnitId) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 52,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
