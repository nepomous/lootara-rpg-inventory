import { memo } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { usePremiumStore } from "@/store/premiumStore";
import { useLoreStore } from "@/store/loreStore";
import { RewardedAdButton } from "@/components/RewardedAdButton";

interface LoreUnlockCardProps {
  itemId: string;
  lore: string;
}

function LoreUnlockCardComponent({ itemId, lore }: LoreUnlockCardProps) {
  const { t } = useTranslation();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const revealedLore = useLoreStore((s) => s.revealedLore);
  const revealLore = useLoreStore((s) => s.revealLore);

  const isRevealed = isPremium || revealedLore[itemId] === true;

  if (isRevealed) {
    return (
      <View className="mt-3 rounded-xl border border-gold/30 bg-gold/5 p-3">
        <View className="mb-2 flex-row items-center gap-1.5">
          <Text className="text-[10px] text-gold">✦</Text>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-gold">
            {t("lore.unlocked_label")}
          </Text>
        </View>
        <Text className="text-sm leading-5 text-text-muted italic">{lore}</Text>
      </View>
    );
  }

  return (
    <View className="mt-3 overflow-hidden rounded-xl border border-border">
      {/* Cabeçalho do card */}
      <View className="bg-background-surface px-3 py-2.5">
        <View className="mb-0.5 flex-row items-center gap-1.5">
          <Text className="text-xs text-gold/60">🔒</Text>
          <Text className="text-xs font-bold uppercase tracking-widest text-gold/80">
            {t("lore.unlock_title")}
          </Text>
        </View>
        <Text className="text-xs leading-4 text-text-muted">
          {t("lore.unlock_subtitle")}
        </Text>
      </View>

      {/* Texto de lore ofuscado como preview */}
      <View className="relative px-3 pb-3 pt-2">
        <Text
          className="text-sm leading-5 text-text-muted italic"
          numberOfLines={2}
          style={{ opacity: 0.25 }}
        >
          {lore}
        </Text>
        {/* Gradiente sutil de blur */}
        <View
          className="absolute bottom-3 left-3 right-3 h-8 rounded-b-lg"
          pointerEvents="none"
        />
      </View>

      {/* Botão de ação */}
      <View className="border-t border-border px-3 py-2.5">
        <Text className="mb-2 text-[10px] text-text-muted">
          {t("lore.locked_hint")}
        </Text>
        <RewardedAdButton
          onRewarded={() => revealLore(itemId)}
          label={t("ads.watch_to_unlock")}
        />
      </View>
    </View>
  );
}

export const LoreUnlockCard = memo(LoreUnlockCardComponent);
