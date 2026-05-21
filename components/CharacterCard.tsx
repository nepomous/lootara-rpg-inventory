import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  CHARACTER_CLASSES,
  CHARACTER_RACES,
  RPG_SYSTEMS,
} from "@/constants/rpg";
import { Colors, Shadows, Typography, Spacing } from "@/constants/theme";
import type { Character } from "@/db/schema";
import { useDeleteCharacter } from "@/hooks/useCharacters";

type Props = {
  character: Character;
  onPress?: () => void;
  onLongPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CharacterCard({ character, onPress, onLongPress }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: deleteCharacter, isPending: isDeleting } =
    useDeleteCharacter();
  const scale = useSharedValue(1);

  const classInfo =
    CHARACTER_CLASSES[character.class as keyof typeof CHARACTER_CLASSES] ??
    CHARACTER_CLASSES.other;
  const raceInfo =
    CHARACTER_RACES[character.race as keyof typeof CHARACTER_RACES] ??
    CHARACTER_RACES.other;
  const systemLabel =
    RPG_SYSTEMS[character.system as keyof typeof RPG_SYSTEMS] ??
    character.system;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.98, { damping: 15 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15 });
  }

  function handlePress() {
    if (onPress) {
      onPress();
    } else {
      router.push(`/character/${character.id}`);
    }
  }

  function handleLongPress() {
    scale.value = withSpring(1, { damping: 15 });
    if (onLongPress) {
      onLongPress();
      return;
    }
    Alert.alert(
      character.name,
      t("common.what_to_do"),
      [
        {
          text: t("common.edit"),
          onPress: () => router.push(`/character/${character.id}?edit=true`),
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () =>
            Alert.alert(
              t("characters.delete_confirm_title"),
              t("characters.delete_confirm_message", { name: character.name }),
              [
                { text: t("common.cancel"), style: "cancel" },
                {
                  text: t("common.delete"),
                  style: "destructive",
                  onPress: () => deleteCharacter(character.id),
                },
              ],
            ),
        },
        { text: t("common.cancel"), style: "cancel" },
      ],
      { cancelable: true },
    );
  }

  return (
    <AnimatedPressable
      style={[animatedStyle, styles.card]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDeleting}
      delayLongPress={400}
    >
      <View className="flex-row items-center p-4 gap-4">
        {/* Círculo com emoji da classe — fundo gold a 15% */}
        <View
          style={styles.avatarCircle}
          className="items-center justify-center"
        >
          <Text className="text-3xl">
            {character.avatarEmoji ?? classInfo.emoji}
          </Text>
        </View>

        {/* Info principal */}
        <View className="flex-1 gap-1">
          <Text style={styles.name} numberOfLines={1}>
            {character.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {t("characters.level", { level: character.level })} ·{" "}
            {classInfo.label} · {raceInfo.label}
          </Text>

          {/* Badge de sistema (pill com borda gold) */}
          <View className="flex-row mt-1">
            <View style={styles.systemBadge}>
              <Text style={styles.systemBadgeText}>{systemLabel}</Text>
            </View>
          </View>
        </View>

        {/* Seta indicadora */}
        <Text style={styles.chevron}>›</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: "hidden",
    ...Shadows.card,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(201,168,76,0.15)",
  },
  name: {
    ...Typography.displayMd,
    fontSize: 15,
    color: Colors.parchment,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  systemBadge: {
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    borderRadius: 9999,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  systemBadgeText: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.gold,
  },
  chevron: {
    fontSize: 20,
    color: Colors.mutedForeground,
  },
});
