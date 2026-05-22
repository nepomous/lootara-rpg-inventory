import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ITEM_CATEGORIES } from "@/constants/rpg";
import type { ItemCategory } from "@/constants/items";
import type { BagItemLocation, RPGSystem } from "@/db/schema";
import type { AddBagItemInput } from "@/hooks/useBag";
import { useLibrary } from "@/hooks/useLibrary";
import type { Item } from "@/hooks/useLibrary";

type Props = {
  visible: boolean;
  characterId: string;
  characterSystem: RPGSystem;
  onClose: () => void;
  onAdd: (input: AddBagItemInput) => void;
  isAdding: boolean;
  onCustomItemCreate?: () => void;
};

const CATEGORY_ENTRIES = Object.entries(ITEM_CATEGORIES) as [
  ItemCategory,
  { label: string; emoji: string },
][];

// ── Tela 1: seleção de item da biblioteca ─────────────────────────────────────
function LibraryPicker({
  characterSystem,
  onSelect,
  onCustom,
}: {
  characterSystem: RPGSystem;
  onSelect: (item: Item) => void;
  onCustom: () => void;
}) {
  const { t } = useTranslation();
  const { items, search, setSearch, activeCategory, setActiveCategory } =
    useLibrary({ system: characterSystem });

  return (
    <View className="flex-1">
      {/* Search bar */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={t("library.search_placeholder")}
        placeholderTextColor="#9ca3af"
        className="mx-4 mb-3 bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-sm"
      />

      {/* Chips de categoria */}
      <FlatList
        horizontal
        data={
          [null, ...CATEGORY_ENTRIES] as (
            | null
            | [ItemCategory, { label: string; emoji: string }]
          )[]
        }
        keyExtractor={(item) => (item === null ? "all" : item[0])}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
          paddingBottom: 8,
        }}
        renderItem={({ item: entry }) => {
          const isAll = entry === null;
          const key = isAll ? null : entry[0];
          const label = isAll
            ? t("library.filter_all")
            : t(`categories.${entry[0]}`);
          const emoji = isAll ? "🗂️" : entry[1].emoji;
          const selected = activeCategory === key;
          return (
            <Pressable
              onPress={() => setActiveCategory(key)}
              className={`flex-row items-center gap-1 px-3 py-1.5 rounded-chip border ${
                selected
                  ? "bg-primary border-primary"
                  : "bg-background-surface border-border"
              }`}
            >
              <Text className="text-sm">{emoji}</Text>
              <Text
                className={`text-xs font-semibold ${
                  selected ? "text-text-inverse" : "text-text-muted"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Item personalizado */}
      <Pressable
        onPress={onCustom}
        className="mx-4 mt-1 mb-2 flex-row items-center gap-3 py-3 px-4 rounded-xl bg-background-surface border border-primary/30"
      >
        <Text className="text-2xl">✏️</Text>
        <View>
          <Text className="text-primary font-semibold text-sm">
            {t("library.custom_item")}
          </Text>
          <Text className="text-text-muted text-xs">
            {t("library.custom_item_subtitle")}
          </Text>
        </View>
      </Pressable>

      {/* Lista de itens */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          gap: 6,
        }}
        renderItem={({ item }) => {
          const catInfo = ITEM_CATEGORIES[item.category];
          return (
            <Pressable
              onPress={() => onSelect(item)}
              className="flex-row items-center gap-3 py-3 px-3 rounded-xl bg-background-card border border-border"
            >
              <View className="w-9 h-9 rounded-lg bg-background-surface items-center justify-center">
                <Text className="text-lg">{catInfo.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-text text-sm font-semibold"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-text-muted text-xs">
                  {item.weight} lbs · {item.cost} {t("library.cost_unit")}
                </Text>
              </View>
              <Text className="text-text-muted text-lg">›</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-text-muted text-sm">
              {t("library.empty")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ── Tela 2: confirmar quantidade e localização ────────────────────────────────
function ConfirmForm({
  item,
  customName,
  characterId,
  isAdding,
  onConfirm,
  onBack,
}: {
  item: Item | null;
  customName: string | null;
  characterId: string;
  isAdding: boolean;
  onConfirm: (input: AddBagItemInput) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState<BagItemLocation>("backpack");

  const LOCATION_OPTIONS: {
    value: BagItemLocation;
    label: string;
    emoji: string;
  }[] = [
    { value: "equipped", label: t("bag.tab_equipped"), emoji: "🧍" },
    { value: "backpack", label: t("bag.tab_backpack"), emoji: "🎒" },
    { value: "stored", label: t("bag.tab_stored"), emoji: "📦" },
  ];

  const displayName = item?.name ?? customName ?? t("library.custom_item");

  return (
    <View className="flex-1 px-4 pt-2">
      {/* Info do item */}
      <View className="bg-background-card border border-border rounded-xl p-4 mb-6 flex-row items-center gap-3">
        {item ? (
          <Text className="text-3xl">
            {ITEM_CATEGORIES[item.category].emoji}
          </Text>
        ) : (
          <Text className="text-3xl">✏️</Text>
        )}
        <View className="flex-1">
          <Text className="text-text font-bold text-base" numberOfLines={1}>
            {displayName}
          </Text>
          {item ? (
            <Text className="text-text-muted text-xs">
              {item.weight} lbs · {item.cost} {t("library.cost_unit")}
            </Text>
          ) : (
            <Text className="text-text-muted text-xs">
              {t("library.custom_item")}
            </Text>
          )}
        </View>
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
      <View className="flex-row gap-3">
        <Pressable
          onPress={onBack}
          className="flex-1 py-3 rounded-xl border border-border items-center"
        >
          <Text className="text-text-muted font-semibold">
            {t("common.back")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() =>
            onConfirm({
              characterId,
              itemId: item?.id ?? null,
              customName: item ? null : customName,
              quantity,
              location,
            })
          }
          disabled={isAdding}
          className="flex-1 py-3 rounded-xl bg-secondary items-center"
        >
          {isAdding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">{t("common.add")}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ── Tela 2b: item personalizado — digitar nome ────────────────────────────────
function CustomNameForm({
  onNext,
  onBack,
}: {
  onNext: (name: string) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  return (
    <View className="px-4 pt-2">
      <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">
        {t("library.custom_item_name_label")}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t("library.custom_item_name_placeholder")}
        placeholderTextColor="#9ca3af"
        maxLength={60}
        className="bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-base mb-6"
        autoFocus
      />
      <View className="flex-row gap-3">
        <Pressable
          onPress={onBack}
          className="flex-1 py-3 rounded-xl border border-border items-center"
        >
          <Text className="text-text-muted font-semibold">
            {t("common.back")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => name.trim() && onNext(name.trim())}
          disabled={!name.trim()}
          className={`flex-1 py-3 rounded-xl items-center ${
            name.trim() ? "bg-secondary" : "bg-background-surface"
          }`}
        >
          <Text
            className={`font-bold ${name.trim() ? "text-white" : "text-border"}`}
          >
            {t("common.next")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────────
type Step = "library" | "custom_name" | "confirm";

export function AddItemModal({
  visible,
  characterId,
  characterSystem,
  onClose,
  onAdd,
  isAdding,
  onCustomItemCreate,
}: Props) {
  const [step, setStep] = useState<Step>("library");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [customName, setCustomName] = useState<string | null>(null);
  const { t } = useTranslation();

  function reset() {
    setStep("library");
    setSelectedItem(null);
    setCustomName(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSelectItem(item: Item) {
    setSelectedItem(item);
    setCustomName(null);
    setStep("confirm");
  }

  function handleCustom() {
    if (onCustomItemCreate) {
      handleClose();
      onCustomItemCreate();
    } else {
      setSelectedItem(null);
      setStep("custom_name");
    }
  }

  function handleCustomName(name: string) {
    setCustomName(name);
    setStep("confirm");
  }

  function handleAdd(input: AddBagItemInput) {
    onAdd(input);
    reset();
  }

  const stepTitle: Record<Step, string> = {
    library: t("library.add_item_title"),
    custom_name: t("library.custom_item"),
    confirm: t("common.confirm"),
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-background pt-4">
        {/* Header do modal */}
        <View className="flex-row items-center justify-between px-4 mb-4">
          <Text className="text-text text-lg font-bold">{stepTitle[step]}</Text>
          <Pressable onPress={handleClose} className="p-2">
            <Text className="text-text-muted text-2xl">✕</Text>
          </Pressable>
        </View>

        {step === "library" && (
          <LibraryPicker
            characterSystem={characterSystem}
            onSelect={handleSelectItem}
            onCustom={handleCustom}
          />
        )}

        {step === "custom_name" && (
          <CustomNameForm
            onNext={handleCustomName}
            onBack={() => setStep("library")}
          />
        )}

        {step === "confirm" && (
          <ConfirmForm
            item={selectedItem}
            customName={customName}
            characterId={characterId}
            isAdding={isAdding}
            onConfirm={handleAdd}
            onBack={() => setStep(selectedItem ? "library" : "custom_name")}
          />
        )}
      </View>
    </Modal>
  );
}
