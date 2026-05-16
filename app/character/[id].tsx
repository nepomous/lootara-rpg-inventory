import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCharacter } from "@/hooks/useCharacters";
import {
  useBag,
  useAddBagItem,
  useRemoveBagItem,
  useUpdateBagItem,
} from "@/hooks/useBag";
import { ItemRow } from "@/components/ItemRow";
import { EditItemModal } from "@/components/EditItemModal";
import { AddItemModal } from "@/components/AddItemModal";
import { AdBanner } from "@/components/AdBanner";
import { CHARACTER_CLASSES, RPG_SYSTEMS } from "@/constants/rpg";
import { calcCarryCapacity, formatWeight } from "@/utils/weight";
import type { BagItem, BagItemLocation } from "@/db/schema";
import type { AddBagItemInput } from "@/hooks/useBag";

type TabId = "backpack" | "equipped" | "stored";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "backpack", label: "Sacola", emoji: "🎒" },
  { id: "equipped", label: "Equipado", emoji: "🧍" },
  { id: "stored", label: "Guardado", emoji: "📦" },
];

function WeightBar({
  carried,
  capacity,
}: {
  carried: number;
  capacity: number;
}) {
  const pct = Math.min(1, carried / capacity);
  const barColor = pct >= 1 ? "#ef4444" : pct >= 0.75 ? "#f59e0b" : "#e8c547";

  return (
    <View className="px-4 py-3 bg-background-card border-t border-border">
      <View className="flex-row justify-between mb-2">
        <Text className="text-text-muted text-xs">Carregando</Text>
        <Text className="text-text text-xs font-semibold">
          {formatWeight(carried)} / {formatWeight(capacity)}
        </Text>
      </View>
      <View className="h-2 rounded-full bg-background-surface overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: barColor }}
        />
      </View>
    </View>
  );
}

export default function CharacterBagScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>("backpack");
  const [addVisible, setAddVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BagItem | null>(null);

  const {
    data: character,
    isLoading: charLoading,
    error: charError,
  } = useCharacter(id);

  const {
    data: bagItems = [],
    isLoading: bagLoading,
    carriedWeight,
  } = useBag(id);

  const { mutate: addItem, isPending: isAdding } = useAddBagItem(id);
  const { mutate: updateItem } = useUpdateBagItem(id);
  const { mutate: removeItem } = useRemoveBagItem(id);

  if (charLoading || bagLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#e8c547" size="large" />
      </View>
    );
  }

  if (charError || !character) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-6xl mb-4">⚠️</Text>
        <Text className="text-text text-lg font-bold text-center mb-2">
          Personagem não encontrado
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="px-6 py-3 rounded-xl bg-secondary"
        >
          <Text className="text-white font-bold">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const classInfo =
    CHARACTER_CLASSES[character.class as keyof typeof CHARACTER_CLASSES];
  const systemLabel = RPG_SYSTEMS[character.system];
  const capacity = calcCarryCapacity(10);
  const bagCount = bagItems.length;
  const filteredItems = bagItems.filter((bi) => bi.location === activeTab);

  function handleAdd(input: AddBagItemInput) {
    addItem(input, { onSuccess: () => setAddVisible(false) });
  }

  function handleRemove(itemId: string) {
    removeItem(itemId);
  }

  function handleUpdateLocation(item: BagItem, location: BagItemLocation) {
    updateItem({ id: item.id, data: { location } });
    setEditingItem(null);
  }

  function handleUpdateQuantity(item: BagItem, quantity: number) {
    updateItem({ id: item.id, data: { quantity } });
    setEditingItem(null);
  }

  function handleDeleteFromEdit(item: BagItem) {
    const displayName = item.customName ?? (item.itemId ? item.itemId : "item");
    Alert.alert("Remover item", `Remover "${displayName}" da sacola?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => {
          setEditingItem(null);
          removeItem(item.id);
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header do personagem */}
      <View className="px-4 pt-4 pb-3 bg-background-card border-b border-border">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-background-surface items-center justify-center">
            <Text className="text-2xl">
              {character.avatarEmoji ?? classInfo?.emoji ?? "🧙"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-text text-lg font-bold" numberOfLines={1}>
              {character.name}
            </Text>
            <Text className="text-text-muted text-xs">
              {classInfo?.label ?? character.class} · Nível {character.level} ·{" "}
              {systemLabel}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-text-muted text-xs">Itens</Text>
            <Text className="text-primary font-bold text-base">{bagCount}</Text>
          </View>
        </View>
      </View>

      {/* Tab bar interna */}
      <View className="flex-row px-4 py-2 gap-2 bg-background-card border-b border-border">
        {TABS.map((tab) => {
          const count = bagItems.filter((bi) => bi.location === tab.id).length;
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl items-center border ${
                selected
                  ? "bg-primary border-primary"
                  : "bg-background-surface border-border"
              }`}
            >
              <Text className="text-base">{tab.emoji}</Text>
              <Text
                className={`text-xs font-semibold ${
                  selected ? "text-text-inverse" : "text-text-muted"
                }`}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  className={`absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center ${
                    selected ? "bg-text-inverse" : "bg-secondary"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selected ? "text-primary" : "text-white"
                    }`}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Lista de itens */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
            <ItemRow
              item={item}
              onEdit={(i) => setEditingItem(i)}
              onRemove={handleRemove}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">
              {activeTab === "equipped"
                ? "🧍"
                : activeTab === "stored"
                  ? "📦"
                  : "🎒"}
            </Text>
            <Text className="text-text font-bold text-base mb-1">
              {activeTab === "equipped"
                ? "Nenhum item equipado"
                : activeTab === "stored"
                  ? "Nenhum item guardado"
                  : "Sacola vazia"}
            </Text>
            <Text className="text-text-muted text-sm text-center px-8">
              Toque no botão + para adicionar itens
            </Text>
          </View>
        }
      />

      {/* Footer de peso */}
      <WeightBar carried={carriedWeight} capacity={capacity} />

      {/* Banner de anúncio */}
      <AdBanner />

      {/* FAB */}
      <Pressable
        onPress={() => setAddVisible(true)}
        className="absolute bottom-24 right-6 w-14 h-14 rounded-full bg-secondary items-center justify-center shadow-lg"
        style={{ elevation: 6 }}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>

      {/* Modal de adicionar item */}
      <AddItemModal
        visible={addVisible}
        characterId={id}
        characterSystem={character.system}
        onClose={() => setAddVisible(false)}
        onAdd={handleAdd}
        isAdding={isAdding}
      />

      {/* Modal de editar item */}
      {editingItem !== null && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onUpdateQuantity={(qty) => handleUpdateQuantity(editingItem, qty)}
          onUpdateLocation={(loc) => handleUpdateLocation(editingItem, loc)}
          onDelete={() => handleDeleteFromEdit(editingItem)}
        />
      )}
    </View>
  );
}
