import { useRouter } from "expo-router";
import { useRef } from "react";
import { Alert, Pressable, Text, View } from "react-native";
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
import type { Character } from "@/db/schema";
import { useDeleteCharacter } from "@/hooks/useCharacters";

type Props = {
  character: Character;
  index: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CharacterCard({ character, index: _index }: Props) {
  const router = useRouter();
  const { mutate: deleteCharacter, isPending: isDeleting } =
    useDeleteCharacter();
  const scale = useSharedValue(1);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    scale.value = withSpring(0.97, { damping: 15 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 15 });
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handlePress() {
    router.push(`/character/${character.id}`);
  }

  function handleLongPress() {
    scale.value = withSpring(1, { damping: 15 });
    Alert.alert(
      character.name,
      "O que deseja fazer?",
      [
        {
          text: "Editar",
          onPress: () => router.push(`/character/${character.id}?edit=true`),
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Excluir personagem",
              `Tem certeza que deseja excluir "${character.name}"? Todos os itens da sacola serão removidos.`,
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Excluir",
                  style: "destructive",
                  onPress: () => deleteCharacter(character.id),
                },
              ],
            ),
        },
        { text: "Cancelar", style: "cancel" },
      ],
      { cancelable: true },
    );
  }

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDeleting}
      delayLongPress={400}
      className="mx-4 mb-3 rounded-card bg-background-card border border-border overflow-hidden active:opacity-90"
    >
      <View className="flex-row items-center p-4 gap-4">
        {/* Avatar emoji da classe */}
        <View className="w-14 h-14 rounded-xl bg-background-surface items-center justify-center">
          <Text className="text-3xl">
            {character.avatarEmoji ?? classInfo.emoji}
          </Text>
        </View>

        {/* Info principal */}
        <View className="flex-1 gap-1">
          <Text className="text-text text-base font-bold" numberOfLines={1}>
            {character.name}
          </Text>
          <Text className="text-text-muted text-sm" numberOfLines={1}>
            {classInfo.label} · {raceInfo.label}
          </Text>

          {/* Chips inferiores */}
          <View className="flex-row gap-2 mt-1">
            <View className="bg-background-surface px-2 py-0.5 rounded-chip">
              <Text className="text-primary text-xs font-semibold">
                Nv {character.level}
              </Text>
            </View>
            <View className="bg-background-surface px-2 py-0.5 rounded-chip">
              <Text className="text-text-muted text-xs">{systemLabel}</Text>
            </View>
          </View>
        </View>

        {/* Seta indicadora */}
        <Text className="text-text-muted text-lg">›</Text>
      </View>
    </AnimatedPressable>
  );
}
