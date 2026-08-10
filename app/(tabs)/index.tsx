import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Dices } from "lucide-react-native";
import { AdBanner } from "@/components/AdBanner";
import { CharacterCard } from "@/components/CharacterCard";
import { ProUpsellSheet } from "@/components/ProUpsellSheet";
import { useCharacters } from "@/hooks/useCharacters";
import { usePremiumStore } from "@/store/premiumStore";
import { FREE_CHARACTER_LIMIT } from "@/constants/rpg";
import type { Character } from "@/db/schema";

const STAGGER_DELAY_MS = 60;

// Item animado com entrada staggered
function AnimatedItem({
  character,
  index,
}: {
  character: Character;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * STAGGER_DELAY_MS)
        .springify()
        .damping(14)}
    >
      <CharacterCard character={character} />
    </Animated.View>
  );
}

function EmptyState() {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        gap: 16,
      }}
    >
      <Dices size={72} color="#c9a84c" strokeWidth={1.5} />
      <Text className="text-parchment text-xl font-bold text-center">
        {t("characters.empty_title")}
      </Text>
      <Text className="text-muted text-sm text-center leading-5">
        {t("characters.empty_subtitle")}
      </Text>
    </View>
  );
}

function FAB({ onPress, bottom }: { onPress: () => void; bottom: number }) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[animatedStyle, { position: "absolute", bottom, right: 24 }]}
      className="shadow-lg"
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.9, { damping: 12 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12 });
        }}
        className="w-14 h-14 rounded-full bg-gold items-center justify-center"
        accessibilityLabel={t("characters.add_cta")}
        accessibilityRole="button"
      >
        <Text className="text-background text-3xl font-light leading-none">
          +
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: characters, isLoading, isError, refetch } = useCharacters();
  const insets = useSafeAreaInsets();
  const [upsellVisible, setUpsellVisible] = useState(false);

  // Altura total da tab bar + safe area (mesma lógica do _layout.tsx)
  const TAB_BAR_HEIGHT = 64;
  const tabBarBottom = insets.bottom > 0 ? insets.bottom : 8;
  const tabBarTotalHeight = TAB_BAR_HEIGHT + tabBarBottom;

  const isPremium = usePremiumStore((s) => s.isPremium);
  const characterCount = characters?.length ?? 0;
  const shouldShowCounter = !isPremium && characterCount > 0;

  // Altura total do rodapé de anúncios: nudge (~24px) + banner (~52px)
  const AD_FOOTER_HEIGHT = isPremium ? 0 : 76;

  // Recarrega ao voltar para a tela (foco)
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  function handleFABPress() {
    if (!isPremium && characterCount >= FREE_CHARACTER_LIMIT) {
      setUpsellVisible(true);
    } else {
      router.push("/character/new");
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#e8c547" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8 gap-3">
        <Text className="text-error text-base font-bold">
          {t("characters.load_error")}
        </Text>
        <Pressable
          onPress={() => void refetch()}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-text-inverse font-semibold">
            {t("common.try_again")}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        style={{ flex: 1 }}
        data={characters ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedItem character={item} index={index} />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={
          (characters ?? []).length === 0
            ? { flexGrow: 1 }
            : {
                paddingTop: shouldShowCounter ? 28 : 12,
                paddingBottom: tabBarTotalHeight + AD_FOOTER_HEIGHT + 72,
              }
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Contador de personagens para usuários do plano grátis */}
      {shouldShowCounter && (
        <Text
          style={{
            position: "absolute",
            top: 8,
            right: 16,
            color: "#8a8a9a",
            fontSize: 12,
          }}
        >
          {t("characters.limit_counter", {
            count: characterCount,
            limit: FREE_CHARACTER_LIMIT,
          })}
        </Text>
      )}

      {/* FAB acima do rodapé de anúncios + tab bar */}
      <FAB
        onPress={handleFABPress}
        bottom={tabBarTotalHeight + AD_FOOTER_HEIGHT + 16}
      />

      {/* Rodapé de anúncios: nudge + banner — fixo acima da tab bar */}
      {!isPremium && (
        <View
          style={{
            position: "absolute",
            bottom: tabBarTotalHeight,
            left: 0,
            right: 0,
          }}
        >
          <Text
            style={{
              color: "#c9a84c",
              fontSize: 11,
              textAlign: "center",
              paddingVertical: 5,
              opacity: 0.8,
            }}
          >
            {t("ads.remove_ads_nudge")}
          </Text>
          <AdBanner variant="home" />
        </View>
      )}

      <ProUpsellSheet
        visible={upsellVisible}
        onClose={() => setUpsellVisible(false)}
        reason="character_limit"
      />
    </View>
  );
}
