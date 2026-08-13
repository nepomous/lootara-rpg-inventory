import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ITEM_CATEGORIES, ITEM_RARITIES } from "@/constants/rpg";
import type { ItemCategory, ItemRarity } from "@/constants/rpg";
import type { BagItemLocation, RPGSystem } from "@/db/schema";
import type { AddBagItemInput } from "@/hooks/useBag";
import { useLibrary } from "@/hooks/useLibrary";
import type { LibraryItem } from "@/hooks/useLibrary";

// ── Constantes de sistema ─────────────────────────────────────────────────────

const PF2E_BULK_OPTIONS = ["L", 1, 2, 3, 4, 5] as const;
const PF2E_STRIKING = [
  "striking",
  "greater striking",
  "major striking",
] as const;
const PF2E_RESILIENT = [
  "resilient",
  "greater resilient",
  "major resilient",
] as const;
const PF2E_PROPERTY_RUNES = [
  "Flaming",
  "Frost",
  "Shock",
  "Corrosive",
  "Ghost Touch",
  "Keen",
  "Speed",
  "Vorpal",
  "Energy-Resistant",
  "Fortification",
  "Shadow",
  "Slick",
] as const;

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
  onSelect: (item: LibraryItem) => void;
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
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
          paddingBottom: 8,
          alignItems: "center",
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
        style={{ flex: 1 }}
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
                  {t(`items.${item.id}.name`, { defaultValue: item.name })}
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

// ── Tela 2: confirmar quantidade, localização e metadados de sistema ──────────
function ConfirmForm({
  item,
  customName,
  characterId,
  characterSystem,
  isAdding,
  onConfirm,
  onBack,
}: {
  item: LibraryItem | null;
  customName: string | null;
  characterId: string;
  characterSystem: RPGSystem;
  isAdding: boolean;
  onConfirm: (input: AddBagItemInput) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState<BagItemLocation>("backpack");

  // Metadados comuns
  const [description, setDescription] = useState("");
  const [rarity, setRarity] = useState<ItemRarity>("common");
  const [magicBonus, setMagicBonus] = useState(0);

  // D&D 5e
  const [attunement, setAttunement] = useState(false);
  const [attunementPrereq, setAttunementPrereq] = useState("");
  const [charges, setCharges] = useState<number | null>(null);
  const [recharge, setRecharge] = useState("");
  const [cursed, setCursed] = useState(false);

  // PF1e
  const [casterLevel, setCasterLevel] = useState<number | null>(null);

  // PF2e
  const [itemLevel, setItemLevel] = useState(1);
  const [bulk, setBulk] = useState<string | number | null>(null);
  const [potencyRune, setPotencyRune] = useState<number | null>(null);
  const [strikingRune, setStrikingRune] = useState<string | null>(null);
  const [resilientRune, setResilientRune] = useState<string | null>(null);
  const [propertyRunes, setPropertyRunes] = useState<string[]>([]);
  const [invested, setInvested] = useState(false);
  const [traits, setTraits] = useState<string[]>([]);
  const [traitInput, setTraitInput] = useState("");

  const LOCATION_OPTIONS: {
    value: BagItemLocation;
    label: string;
    emoji: string;
  }[] = [
    { value: "equipped", label: t("bag.tab_equipped"), emoji: "🧍" },
    { value: "backpack", label: t("bag.tab_backpack"), emoji: "🎒" },
    { value: "stored", label: t("bag.tab_stored"), emoji: "📦" },
  ];

  const displayName = item
    ? t(`items.${item.id}.name`, { defaultValue: item.name })
    : (customName ?? t("library.custom_item"));

  function buildSystemMeta(): string | null {
    switch (characterSystem) {
      case "dnd5e": {
        const meta: Record<string, unknown> = {};
        if (attunement) {
          meta.attunement = true;
          if (attunementPrereq.trim())
            meta.attunementPrereq = attunementPrereq.trim();
        }
        if (charges !== null) meta.charges = charges;
        if (recharge.trim()) meta.recharge = recharge.trim();
        if (cursed) meta.cursed = true;
        return Object.keys(meta).length > 0 ? JSON.stringify(meta) : null;
      }
      case "pf1": {
        const meta: Record<string, unknown> = {};
        if (casterLevel !== null) meta.casterLevel = casterLevel;
        return Object.keys(meta).length > 0 ? JSON.stringify(meta) : null;
      }
      case "pf2": {
        const meta: Record<string, unknown> = { itemLevel };
        if (bulk !== null) meta.bulk = bulk;
        if (potencyRune !== null) meta.potencyRune = potencyRune;
        if (strikingRune) meta.strikingRune = strikingRune;
        if (resilientRune) meta.resilientRune = resilientRune;
        if (propertyRunes.length > 0) meta.propertyRunes = propertyRunes;
        if (invested) meta.invested = true;
        if (traits.length > 0) meta.traits = traits;
        return JSON.stringify(meta);
      }
      default:
        return null;
    }
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              className={`text-xl font-bold ${
                quantity <= 1 ? "text-border" : "text-text"
              }`}
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
        <View className="flex-row gap-2 mb-6">
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

        {/* ── Descrição ─────────────────────────────────────────────────────── */}
        <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("custom_items.field_description")}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t("custom_items.description_placeholder")}
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          className="bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-sm mb-6"
          style={{ minHeight: 72, textAlignVertical: "top" }}
        />

        {/* ── Raridade (oculto para PF1e) ───────────────────────────────────── */}
        {characterSystem !== "pf1" && (
          <>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.rarity")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {(
                Object.entries(ITEM_RARITIES) as [
                  ItemRarity,
                  { label: string; color: string },
                ][]
              ).map(([key, val]) => {
                const selected = rarity === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setRarity(key)}
                    className="px-3 py-2 rounded-chip border bg-background-surface"
                    style={{
                      borderColor: selected ? val.color : "#374151",
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: selected ? val.color : "#9ca3af" }}
                    >
                      {t(`library.rarity_${key}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* ── Bônus Mágico ──────────────────────────────────────────────────── */}
        <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
          {t("item_meta.magic_bonus")}
        </Text>
        <View className="flex-row items-center gap-3 mb-6">
          <Pressable
            onPress={() => setMagicBonus((v) => Math.max(0, v - 1))}
            disabled={magicBonus <= 0}
            className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border"
          >
            <Text
              className={`text-xl font-bold ${
                magicBonus <= 0 ? "text-border" : "text-text"
              }`}
            >
              −
            </Text>
          </Pressable>
          <Text className="text-primary text-2xl font-bold min-w-8 text-center">
            {magicBonus > 0
              ? `+${magicBonus}`
              : t("item_meta.magic_bonus_none")}
          </Text>
          <Pressable
            onPress={() => setMagicBonus((v) => Math.min(5, v + 1))}
            disabled={magicBonus >= 5}
            className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border"
          >
            <Text
              className={`text-xl font-bold ${
                magicBonus >= 5 ? "text-border" : "text-text"
              }`}
            >
              +
            </Text>
          </Pressable>
        </View>

        {/* ── Campos D&D 5e ─────────────────────────────────────────────────── */}
        {characterSystem === "dnd5e" && (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text text-sm font-medium">
                {t("item_meta.attunement")}
              </Text>
              <Switch
                value={attunement}
                onValueChange={setAttunement}
                trackColor={{ true: "#f59e0b", false: "#374151" }}
                thumbColor="#f5f0e8"
              />
            </View>
            {attunement && (
              <>
                <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
                  {t("item_meta.attunement_prereq")}
                </Text>
                <TextInput
                  value={attunementPrereq}
                  onChangeText={setAttunementPrereq}
                  placeholder={t("item_meta.attunement_prereq_placeholder")}
                  placeholderTextColor="#9ca3af"
                  className="bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-sm mb-4"
                />
              </>
            )}
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.charges")}
            </Text>
            <TextInput
              value={charges !== null ? String(charges) : ""}
              onChangeText={(v) =>
                setCharges(v === "" ? null : parseInt(v, 10) || 0)
              }
              keyboardType="number-pad"
              placeholder={t("item_meta.charges_placeholder")}
              placeholderTextColor="#9ca3af"
              className="bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-sm mb-4"
            />
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.recharge")}
            </Text>
            <TextInput
              value={recharge}
              onChangeText={setRecharge}
              placeholder={t("item_meta.recharge_placeholder")}
              placeholderTextColor="#9ca3af"
              className="bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-sm mb-4"
            />
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-text text-sm font-medium">
                {t("item_meta.cursed")}
              </Text>
              <Switch
                value={cursed}
                onValueChange={setCursed}
                trackColor={{ true: "#ef4444", false: "#374151" }}
                thumbColor="#f5f0e8"
              />
            </View>
          </>
        )}

        {/* ── Campos PF1e ───────────────────────────────────────────────────── */}
        {characterSystem === "pf1" && (
          <>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.caster_level")}
            </Text>
            <TextInput
              value={casterLevel !== null ? String(casterLevel) : ""}
              onChangeText={(v) =>
                setCasterLevel(v === "" ? null : parseInt(v, 10) || null)
              }
              keyboardType="number-pad"
              placeholder={t("item_meta.caster_level_placeholder")}
              placeholderTextColor="#9ca3af"
              className="bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-sm mb-4"
            />
          </>
        )}

        {/* ── Campos PF2e ───────────────────────────────────────────────────── */}
        {characterSystem === "pf2" && (
          <>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.item_level")} *
            </Text>
            <View className="flex-row items-center gap-3 mb-4">
              <Pressable
                onPress={() => setItemLevel((v) => Math.max(1, v - 1))}
                disabled={itemLevel <= 1}
                className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border"
              >
                <Text
                  className={`text-xl font-bold ${
                    itemLevel <= 1 ? "text-border" : "text-text"
                  }`}
                >
                  −
                </Text>
              </Pressable>
              <Text className="text-primary text-2xl font-bold min-w-8 text-center">
                {itemLevel}
              </Text>
              <Pressable
                onPress={() => setItemLevel((v) => Math.min(25, v + 1))}
                disabled={itemLevel >= 25}
                className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border"
              >
                <Text
                  className={`text-xl font-bold ${
                    itemLevel >= 25 ? "text-border" : "text-text"
                  }`}
                >
                  +
                </Text>
              </Pressable>
            </View>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.bulk")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PF2E_BULK_OPTIONS.map((opt) => {
                const active = bulk === opt;
                return (
                  <Pressable
                    key={String(opt)}
                    onPress={() => setBulk(active ? null : opt)}
                    className={`px-4 py-2 rounded-chip border ${
                      active
                        ? "bg-primary border-primary"
                        : "bg-background-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? "text-text-inverse" : "text-text-muted"
                      }`}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.potency_rune")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {([0, 1, 2, 3] as const).map((opt) => {
                const active = potencyRune === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() =>
                      setPotencyRune(active && opt !== 0 ? null : opt)
                    }
                    className={`px-4 py-2 rounded-chip border ${
                      active && opt > 0
                        ? "border-amber-600"
                        : active
                          ? "bg-primary border-primary"
                          : "bg-background-surface border-border"
                    }`}
                    style={
                      active && opt > 0
                        ? { backgroundColor: "#d97706" }
                        : undefined
                    }
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? "text-white" : "text-text-muted"
                      }`}
                    >
                      {opt === 0
                        ? t("item_meta.magic_bonus_none", "+0")
                        : `+${opt}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.striking_rune")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PF2E_STRIKING.map((opt) => {
                const active = strikingRune === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setStrikingRune(active ? null : opt)}
                    className={`px-3 py-2 rounded-chip border ${
                      active
                        ? "bg-primary border-primary"
                        : "bg-background-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? "text-text-inverse" : "text-text-muted"
                      }`}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.resilient_rune")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PF2E_RESILIENT.map((opt) => {
                const active = resilientRune === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setResilientRune(active ? null : opt)}
                    className={`px-3 py-2 rounded-chip border ${
                      active
                        ? "bg-primary border-primary"
                        : "bg-background-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? "text-text-inverse" : "text-text-muted"
                      }`}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.property_runes")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PF2E_PROPERTY_RUNES.map((rune) => {
                const active = propertyRunes.includes(rune);
                const atMax = propertyRunes.length >= 3;
                return (
                  <Pressable
                    key={rune}
                    onPress={() => {
                      if (active)
                        setPropertyRunes((prev) =>
                          prev.filter((r) => r !== rune),
                        );
                      else if (!atMax)
                        setPropertyRunes((prev) => [...prev, rune]);
                    }}
                    className={`px-3 py-2 rounded-chip border ${
                      active
                        ? "bg-primary border-primary"
                        : "bg-background-surface border-border"
                    }`}
                    style={!active && atMax ? { opacity: 0.4 } : undefined}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? "text-text-inverse" : "text-text-muted"
                      }`}
                    >
                      {rune}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text text-sm font-medium">
                {t("item_meta.invested")}
              </Text>
              <Switch
                value={invested}
                onValueChange={setInvested}
                trackColor={{ true: "#f59e0b", false: "#374151" }}
                thumbColor="#f5f0e8"
              />
            </View>
            <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-2">
              {t("item_meta.traits")}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {traits.map((trait, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    setTraits((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-chip bg-primary border border-primary"
                >
                  <Text className="text-text-inverse text-xs font-semibold">
                    {trait}
                  </Text>
                  <Text className="text-text-inverse text-xs">×</Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-2 mb-6">
              <TextInput
                value={traitInput}
                onChangeText={setTraitInput}
                placeholder={t("item_meta.traits_placeholder")}
                placeholderTextColor="#9ca3af"
                className="flex-1 bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-sm"
                onSubmitEditing={() => {
                  const trimmed = traitInput.trim();
                  if (trimmed && !traits.includes(trimmed))
                    setTraits((prev) => [...prev, trimmed]);
                  setTraitInput("");
                }}
                returnKeyType="done"
              />
              <Pressable
                onPress={() => {
                  const trimmed = traitInput.trim();
                  if (trimmed && !traits.includes(trimmed))
                    setTraits((prev) => [...prev, trimmed]);
                  setTraitInput("");
                }}
                className="px-4 rounded-xl bg-background-surface border border-border items-center justify-center"
              >
                <Text className="text-text font-bold">+</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* Botões fixos no rodapé */}
      <View className="flex-row gap-3 px-4 pb-6 pt-3 border-t border-border">
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
              isCustom: item?.isCustom ?? false,
              quantity,
              location,
              description: description.trim() || null,
              rarity: characterSystem !== "pf1" ? rarity : null,
              magicBonus,
              systemMeta: buildSystemMeta(),
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
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
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

  function handleSelectItem(item: LibraryItem) {
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
            characterSystem={characterSystem}
            isAdding={isAdding}
            onConfirm={handleAdd}
            onBack={() => setStep(selectedItem ? "library" : "custom_name")}
          />
        )}
      </View>
    </Modal>
  );
}
