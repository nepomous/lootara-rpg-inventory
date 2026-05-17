import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AdBanner } from "@/components/AdBanner";
import { CharacterCard } from "@/components/CharacterCard";
import { useCharacters } from "@/hooks/useCharacters";
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
  return (
    <View className="flex-1 items-center justify-center px-8 gap-4">
      <Text className="text-5xl">🎲</Text>
      <Text className="text-text text-xl font-bold text-center">
        Nenhum aventureiro ainda...
      </Text>
      <Text className="text-text-muted text-sm text-center leading-5">
        Toque no botão <Text className="text-secondary font-bold">+</Text> para
        criar seu primeiro personagem e começar sua jornada!
      </Text>
    </View>
  );
}

function FAB({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute bottom-20 right-6 shadow-lg"
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.9, { damping: 12 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12 });
        }}
        className="w-14 h-14 rounded-full bg-secondary items-center justify-center"
        accessibilityLabel="Criar novo personagem"
        accessibilityRole="button"
      >
        <Text className="text-white text-3xl font-light leading-none">+</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { data: characters, isLoading, isError, refetch } = useCharacters();

  // Recarrega ao voltar para a tela (foco)
  useEffect(() => {
    void refetch();
  }, [refetch]);

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
          Erro ao carregar personagens
        </Text>
        <Pressable
          onPress={() => void refetch()}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-text-inverse font-semibold">
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={characters ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatedItem character={item} index={index} />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={
          (characters ?? []).length === 0
            ? { flexGrow: 1 }
            : { paddingTop: 12, paddingBottom: 96 }
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB onPress={() => router.push("/character/new")} />

      {/* Banner de anúncio fixo no rodapé */}
      <View className="absolute bottom-0 left-0 right-0">
        <AdBanner />
      </View>
    </View>
  );
}
