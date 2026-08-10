import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Trash2 } from "lucide-react-native";
import { CHARACTER_CLASSES, CHARACTER_RACES } from "@/constants/rpg";
import { Colors, Shadows, Typography, Spacing } from "@/constants/theme";
import type { Character } from "@/db/schema";
import { useDeleteCharacter } from "@/hooks/useCharacters";

const SWIPE_THRESHOLD = -80;

type Props = {
  character: Character;
  onPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CharacterCard({ character, onPress }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: deleteCharacter, isPending: isDeleting } =
    useDeleteCharacter();
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const deleteVisible = useSharedValue(false);

  const classInfo =
    CHARACTER_CLASSES[character.class as keyof typeof CHARACTER_CLASSES] ??
    CHARACTER_CLASSES.other;
  const raceInfo =
    CHARACTER_RACES[character.race as keyof typeof CHARACTER_RACES] ??
    CHARACTER_RACES.other;
  const systemLabel = t(`characters.system_${character.system}`);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  const deleteOverlayStyle = useAnimatedStyle(() => ({
    opacity: withTiming(deleteVisible.value ? 1 : 0, { duration: 150 }),
  }));

  function handlePress() {
    if (onPress) {
      onPress();
    } else {
      router.push(`/character/${character.id}`);
    }
  }

  function confirmDelete() {
    Alert.alert(
      t("characters.delete_confirm_title"),
      t("characters.delete_confirm_message", { name: character.name }),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () => {
            translateX.value = withSpring(0);
            deleteVisible.value = false;
          },
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteCharacter(character.id),
        },
      ],
    );
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      const val = Math.max(-100, Math.min(0, e.translationX));
      translateX.value = val;
      deleteVisible.value = val < SWIPE_THRESHOLD;
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-80);
      } else {
        translateX.value = withSpring(0);
        deleteVisible.value = false;
      }
    });

  return (
    <View style={styles.container}>
      {/* Fundo vermelho revelado pelo swipe */}
      <Animated.View style={[styles.deleteBackground, deleteOverlayStyle]}>
        <Pressable onPress={confirmDelete} style={styles.deleteButton}>
          <Trash2 size={20} color="#fff" />
          <Text style={styles.deleteText}>{t("common.delete")}</Text>
        </Pressable>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <AnimatedPressable
          style={[cardStyle, styles.card]}
          onPress={handlePress}
          onPressIn={() => {
            scale.value = withSpring(0.98, { damping: 15 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 15 });
          }}
          disabled={isDeleting}
        >
          <View className="flex-row items-center p-4 gap-4">
            <View
              style={styles.avatarCircle}
              className="items-center justify-center"
            >
              <Text className="text-3xl">
                {character.avatarEmoji ?? classInfo.emoji}
              </Text>
            </View>

            <View className="flex-1 gap-1">
              <Text style={styles.name} numberOfLines={1}>
                {character.name}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {t("characters.level", { level: character.level })} ·{" "}
                {t(`classes.${character.class}`, {
                  defaultValue: classInfo.label,
                })}{" "}
                ·{" "}
                {t(`races.${character.race}`, { defaultValue: raceInfo.label })}
              </Text>

              <View className="flex-row mt-1">
                <View style={styles.systemBadge}>
                  <Text style={styles.systemBadgeText}>{systemLabel}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.chevron}>›</Text>
          </View>
        </AnimatedPressable>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    position: "relative",
  },
  card: {
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: "hidden",
    ...Shadows.card,
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    overflow: "hidden",
  },
  deleteButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  deleteText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
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
