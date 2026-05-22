import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCharacter } from "@/hooks/useCharacters";
import {
  useBag,
  useAddBagItem,
  useRemoveBagItem,
  useUpdateBagItem,
} from "@/hooks/useBag";
import type { BagItemWithDetails } from "@/hooks/useBag";
import { ItemRow } from "@/components/ItemRow";
import { EditItemModal } from "@/components/EditItemModal";
import { AddItemModal } from "@/components/AddItemModal";
import { CustomItemForm } from "@/components/CustomItemForm";
import type { CustomItemFormRef } from "@/components/CustomItemForm";
import { AdBanner } from "@/components/AdBanner";
import { CHARACTER_CLASSES } from "@/constants/rpg";
import { calcCarryCapacity, formatWeight } from "@/utils/weight";
import { getCustomItemById } from "@/db/index";
import type { BagItem, BagItemLocation, CustomItem } from "@/db/schema";
import type { AddBagItemInput } from "@/hooks/useBag";

type TabId = "backpack" | "equipped" | "stored";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "backpack", label: "bag.tab_backpack", emoji: "🎒" },
  { id: "equipped", label: "bag.tab_equipped", emoji: "🧔" },
  { id: "stored", label: "bag.tab_stored", emoji: "📦" },
];

function WeightBar({
  carried,
  capacity,
}: {
  carried: number;
  capacity: number;
}) {
  const { t } = useTranslation();
  const pct = Math.min(1, carried / capacity);
  const barColor = pct >= 1 ? "#ef4444" : pct >= 0.75 ? "#f59e0b" : "#e8c547";

  return (
    <View className="px-4 py-3 bg-background-card border-t border-border">
      <View className="flex-row justify-between mb-2">
        <Text className="text-text-muted text-xs">{t("bag.carrying")}</Text>
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
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabId>("backpack");
  const [addVisible, setAddVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<BagItemWithDetails | null>(
    null,
  );
  const [selectedCustomItem, setSelectedCustomItem] =
    useState<CustomItem | null>(null);
  const customFormRef = useRef<CustomItemFormRef>(null);

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
          {t("characters.not_found")}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="px-6 py-3 rounded-xl bg-secondary"
        >
          <Text className="text-white font-bold">{t("common.back")}</Text>
        </Pressable>
      </View>
    );
  }

  const classInfo =
    CHARACTER_CLASSES[character.class as keyof typeof CHARACTER_CLASSES];
  const systemLabel = t(`characters.system_${character.system}`);
  const capacity = calcCarryCapacity(10);
  const bagCount = bagItems.length;
  const filteredItems = bagItems.filter((bi) => bi.location === activeTab);

  function handleAdd(input: AddBagItemInput) {
    addItem(input, { onSuccess: () => setAddVisible(false) });
  }

  function handleEdit(item: BagItemWithDetails) {
    if (item.isCustom === 1 && item.itemId) {
      const customItem = getCustomItemById(item.itemId);
      if (customItem) {
        Alert.alert(item.itemName, t("bag.edit_custom_item_prompt"), [
          {
            text: t("bag.edit_in_bag"),
            onPress: () => setEditingItem(item),
          },
          {
            text: t("bag.edit_item_definition"),
            onPress: () => {
              setSelectedCustomItem(customItem);
              customFormRef.current?.present();
            },
          },
          { text: t("common.cancel"), style: "cancel" },
        ]);
        return;
      }
    }
    setEditingItem(item);
  }

  function handleCustomItemSave(savedItem: CustomItem) {
    // If we were editing an existing custom item from the bag, no add needed
    if (selectedCustomItem) {
      setSelectedCustomItem(null);
      return;
    }
    // New custom item created from "Criar item personalizado" — auto-add to bag
    addItem({
      characterId: id,
      itemId: savedItem.id,
      customName: null,
      quantity: 1,
      location: "backpack",
      isCustom: true,
    });
    setSelectedCustomItem(null);
  }

  function handleCustomItemDelete(_deletedId: string) {
    setSelectedCustomItem(null);
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

  function handleDeleteFromEdit(item: BagItemWithDetails) {
    const displayName = item.itemName;
    Alert.alert(
      t("bag.remove_item"),
      t("bag.remove_confirm_message", { name: displayName }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("bag.remove_item"),
          style: "destructive",
          onPress: () => {
            setEditingItem(null);
            removeItem(item.id);
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: t("bag.title") }} />
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
            <Text className="text-text text-xs">
              {t(`classes.${character.class}`, {
                defaultValue: classInfo?.label ?? character.class,
              })}{" "}
              · {t("characters.level", { level: character.level })} ·{" "}
              {systemLabel}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-text-muted text-xs">
              {t("bag.items_count")}
            </Text>
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
                {t(tab.label as Parameters<typeof t>[0])}
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
              onEdit={(i) => handleEdit(i)}
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
                ? t("bag.empty_equipped")
                : activeTab === "stored"
                  ? t("bag.empty_stored")
                  : t("bag.empty_title")}
            </Text>
            <Text className="text-text-muted text-sm text-center px-8">
              {t("bag.add_tap_hint")}
            </Text>
          </View>
        }
      />

      {/* Footer de peso */}
      <WeightBar carried={carriedWeight} capacity={capacity} />

      {/* Banner de anúncio — estático após o footer de peso, nunca sobreposto */}
      <AdBanner variant="character" />

      {/* FAB */}
      <Pressable
        onPress={() => setAddVisible(true)}
        className="absolute bottom-36 right-6 w-14 h-14 rounded-full bg-secondary items-center justify-center shadow-lg"
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
        onCustomItemCreate={() => {
          setSelectedCustomItem(null);
          customFormRef.current?.present();
        }}
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

      {/* Bottom sheet para criar/editar item personalizado */}
      <CustomItemForm
        ref={customFormRef}
        item={selectedCustomItem ?? undefined}
        onSave={handleCustomItemSave}
        onDelete={handleCustomItemDelete}
      />
    </View>
  );
}
