import { useEffect, useRef, useState } from "react";
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from "react-native-google-mobile-ads";
import { AdUnits } from "@/services/admob";

interface UseRewardedAdResult {
  show: () => void;
  isLoaded: boolean;
  isLoading: boolean;
}

export function useRewardedAd(
  onRewarded: () => void,
  onIncomplete: () => void,
): UseRewardedAdResult {
  const adRef = useRef<RewardedAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ad = RewardedAd.createForAdRequest(AdUnits.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });
    adRef.current = ad;

    const unsubLoad = ad.addAdEventListener(AdEventType.LOADED, () => {
      setIsLoaded(true);
      setIsLoading(false);
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setIsLoaded(false);
      setIsLoading(false);
    });

    const unsubClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      // Se fechar sem recompensa, o onRewarded não foi chamado — notifica incompleto
      // Recarrega ad para próximo uso
      setIsLoaded(false);
      setIsLoading(true);
      onIncomplete();
      ad.load();
    });

    const unsubRewarded = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        onRewarded();
      },
    );

    setIsLoading(true);
    ad.load();

    return () => {
      unsubLoad();
      unsubError();
      unsubClose();
      unsubRewarded();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function show() {
    if (adRef.current && isLoaded) {
      adRef.current.show();
    }
  }

  return { show, isLoaded, isLoading };
}
