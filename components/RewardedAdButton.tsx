import React, { memo } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { usePremiumStore } from "@/store/premiumStore";
import { useRewardedAd } from "@/hooks/useRewardedAd";
import { Colors } from "@/constants/theme";

interface RewardedAdButtonProps {
  onRewarded: () => void;
  label?: string;
}

function RewardedAdButtonComponent({
  onRewarded,
  label,
}: RewardedAdButtonProps) {
  const { t } = useTranslation();
  const isPremium = usePremiumStore((s) => s.isPremium);

  // Usuário premium já tem acesso livre — não exibir o botão
  if (isPremium) return null;

  return (
    <RewardedAdButtonInner
      onRewarded={onRewarded}
      label={label ?? t("ads.watch_to_unlock")}
    />
  );
}

// Componente interno separado para conter os efeitos do hook sem condicional
function RewardedAdButtonInner({
  onRewarded,
  label,
}: {
  onRewarded: () => void;
  label: string;
}) {
  const { t } = useTranslation();
  const { show, isLoaded, isLoading } = useRewardedAd(onRewarded, () => {
    // Feedback de incompleto é emitido via prop — o pai pode exibir toast
  });

  return (
    <TouchableOpacity
      style={[styles.button, !isLoaded && styles.buttonDisabled]}
      onPress={show}
      disabled={!isLoaded}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.gold} />
      ) : (
        <View style={styles.row}>
          {/* Ícone de play representado com texto para evitar dependência extra */}
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export const RewardedAdButton = memo(RewardedAdButtonComponent);

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderColor: Colors.gold,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  buttonDisabled: {
    borderColor: Colors.mutedForeground,
    opacity: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playIcon: {
    color: Colors.gold,
    fontSize: 12,
  },
  label: {
    color: Colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },
});
