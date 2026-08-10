import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { getItemById } from "@/constants/items";
import { ITEM_CATEGORIES } from "@/constants/rpg";
import type { BagItem, BagItemLocation } from "@/db/schema";

type Props = {
  item: BagItem;
  onClose: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateLocation: (location: BagItemLocation) => void;
  onDelete: () => void;
};

export function EditItemModal({
  item,
  onClose,
  onUpdateQuantity,
  onUpdateLocation,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(item.quantity);
  const [location, setLocation] = useState<BagItemLocation>(item.location);

  const LOCATION_OPTIONS: {
    value: BagItemLocation;
    label: string;
    emoji: string;
  }[] = [
    { value: "equipped", label: t("bag.tab_equipped"), emoji: "🧍" },
    { value: "backpack", label: t("bag.tab_backpack"), emoji: "🎒" },
    { value: "stored", label: t("bag.tab_stored"), emoji: "📦" },
  ];

  const staticItem = item.itemId ? getItemById(item.itemId) : null;
  const displayName = staticItem
    ? t(`items.${staticItem.id}.name`, { defaultValue: staticItem.name })
    : (item.customName ?? t("library.custom_item"));
  const categoryInfo = staticItem
    ? ITEM_CATEGORIES[staticItem.category]
    : { emoji: "🎁", label: "" };

  function handleSave() {
    if (quantity !== item.quantity) onUpdateQuantity(quantity);
    if (location !== item.location) onUpdateLocation(location);
    if (quantity === item.quantity && location === item.location) onClose();
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background pt-4 px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-lg font-bold">
            {t("bag.edit_item_title")}
          </Text>
          <Pressable onPress={onClose} className="p-2">
            <Text className="text-text-muted text-2xl">✕</Text>
          </Pressable>
        </View>

        {/* Info do item */}
        <View className="bg-background-card border border-border rounded-xl p-4 mb-6 flex-row items-center gap-3">
          <Text className="text-3xl">{categoryInfo.emoji}</Text>
          <Text
            className="text-text font-bold text-base flex-1"
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </View>

        {/* Quantidade */}
        <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">
          {t("bag.quantity_label")}
        </Text>
        <View className="flex-row items-center gap-4 mb-6">
          <Pressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border"
          >
            <Text
              className={`text-xl font-bold ${quantity <= 1 ? "text-border" : "text-text"}`}
            >
              −
            </Text>
          </Pressable>
          <Text className="text-primary text-2xl font-bold min-w-8 text-center">
            {quantity}
          </Text>
          <Pressable
            onPress={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border"
          >
            <Text className="text-xl font-bold text-text">+</Text>
          </Pressable>
        </View>

        {/* Localização */}
        <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">
          {t("bag.location_label")}
        </Text>
        <View className="flex-row gap-2 mb-8">
          {LOCATION_OPTIONS.map((opt) => {
            const selected = location === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setLocation(opt.value)}
                className={`flex-1 items-center py-3 rounded-xl border ${
                  selected
                    ? "bg-primary border-primary"
                    : "bg-background-surface border-border"
                }`}
              >
                <Text className="text-2xl mb-1">{opt.emoji}</Text>
                <Text
                  className={`text-xs font-semibold text-center ${
                    selected ? "text-text-inverse" : "text-text-muted"
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Botões */}
        <View className="gap-3">
          <Pressable
            onPress={handleSave}
            className="py-3 rounded-xl bg-secondary items-center"
          >
            <Text className="text-white font-bold">
              {t("bag.save_changes")}
            </Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            className="py-3 rounded-xl border border-red-500/40 items-center"
          >
            <Text className="text-red-400 font-semibold">
              {t("bag.remove_item")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
