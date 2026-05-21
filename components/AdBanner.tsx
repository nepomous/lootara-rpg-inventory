import React, { memo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { usePremiumStore } from "@/store/premiumStore";
import { AdUnits } from "@/services/admob";
import { Colors } from "@/constants/theme";

// Altura reservada para evitar layout shift enquanto o ad carrega
const AD_PLACEHOLDER_HEIGHT = 52;

interface AdBannerProps {
  variant: "home" | "character";
}

function AdBannerComponent({ variant }: AdBannerProps) {
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (isPremium || failed) return null;

  const unitId =
    variant === "home" ? AdUnits.bannerHome : AdUnits.bannerCharacter;

  return (
    <View style={styles.wrapper}>
      {/* Placeholder invisível mantém o espaço antes do ad carregar */}
      {!loaded && <View style={styles.placeholder} />}
      <View style={loaded ? styles.container : styles.hidden}>
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={() => setLoaded(true)}
          onAdFailedToLoad={() => setFailed(true)}
        />
      </View>
    </View>
  );
}

export const AdBanner = memo(AdBannerComponent);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    overflow: "hidden",
  },
  placeholder: {
    height: AD_PLACEHOLDER_HEIGHT,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  hidden: {
    position: "absolute",
    opacity: 0,
    pointerEvents: "none",
  },
});
