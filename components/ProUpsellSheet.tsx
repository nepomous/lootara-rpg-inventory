import {
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { usePremium } from "@/hooks/usePremium";
import { usePremiumStore } from "@/store/premiumStore";
import { Colors } from "@/constants/theme";

export type UpsellReason = "character_limit" | "backup";

interface Props {
  visible: boolean;
  onClose: () => void;
  reason: UpsellReason;
}

function BenefitItem({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <CheckCircle2 size={16} color={Colors.gold} />
      <Text className="text-parchment text-sm flex-1">{label}</Text>
    </View>
  );
}

export function ProUpsellSheet({ visible, onClose, reason }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { purchasePremium, restorePurchases, isLoading, offerPrice } =
    usePremium();

  // Block close while a transaction is in progress
  const safeClose = isLoading ? () => {} : onClose;

  async function handlePurchase() {
    try {
      await purchasePremium();
      if (usePremiumStore.getState().isPremium) {
        onClose();
        if (reason === "character_limit") {
          router.push("/character/new");
        }
      }
    } catch (e: unknown) {
      // code 1 = PURCHASE_CANCELLED_ERROR (RevenueCat) — not an error, silently ignore
      if ((e as { code?: number })?.code !== 1) {
        Alert.alert(t("pro.purchase_error"));
      }
    }
  }

  async function handleRestore() {
    try {
      await restorePurchases();
      // restorePurchases already shows its own result Alert — just close if now premium
      if (usePremiumStore.getState().isPremium) {
        onClose();
      }
    } catch {
      // restorePurchases handles its own errors internally
    }
  }

  const subtitle =
    reason === "character_limit"
      ? t("pro.upsell_reason_characters")
      : t("pro.upsell_reason_backup");

  const ctaLabel = offerPrice
    ? t("pro.cta_unlock", { price: offerPrice })
    : t("pro.cta_unlock_no_price");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={safeClose}
    >
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={safeClose}>
        {/* Inner pressable stops tap-through to backdrop */}
        <Pressable
          onPress={() => {}}
          className="bg-surface rounded-t-3xl px-6 pt-6 pb-10"
        >
          <Text className="text-parchment text-2xl font-bold text-center mb-2">
            {t("pro.upsell_title")}
          </Text>

          <Text className="text-muted text-sm text-center mb-6">
            {subtitle}
          </Text>

          <View className="mb-4">
            <BenefitItem label={t("pro.benefit_unlimited_characters")} />
            <BenefitItem label={t("pro.benefit_no_ads")} />
            <BenefitItem label={t("pro.benefit_backup")} />
          </View>

          {offerPrice ? (
            <Text className="text-muted text-xs text-center mb-1">
              {t("settings.premium_offer_price", { price: offerPrice })}
            </Text>
          ) : null}

          <Text className="text-parchment text-xs text-center font-semibold mb-5">
            {t("pro.reassure_onetime")}
          </Text>

          <Pressable
            onPress={() => void handlePurchase()}
            disabled={isLoading}
            className="bg-gold rounded-2xl py-4 items-center mb-3"
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text className="text-background text-base font-bold">
                {ctaLabel}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => void handleRestore()}
            disabled={isLoading}
            className="py-3 items-center"
          >
            <Text className="text-gold text-sm">{t("pro.cta_restore")}</Text>
          </Pressable>

          <Pressable onPress={safeClose} className="py-2 items-center">
            <Text className="text-muted text-sm">{t("pro.maybe_later")}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
