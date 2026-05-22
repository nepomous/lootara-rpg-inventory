import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  SectionList,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pencil, Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ITEM_CATEGORIES, ITEM_RARITIES } from "@/constants/rpg";
import type { ItemCategory } from "@/constants/rpg";
import { Colors } from "@/constants/theme";
import { useLibrary } from "@/hooks/useLibrary";
import { useCustomItems } from "@/hooks/useCustomItems";
import type { CustomItem } from "@/hooks/useCustomItems";
import { CustomItemForm } from "@/components/CustomItemForm";
import type { CustomItemFormRef } from "@/components/CustomItemForm";
import type { Item } from "@/constants/items";
import { LoreUnlockCard } from "@/components/LoreUnlockCard";

type FilterValue = ItemCategory | "custom" | null;
type RowData =
  | { type: "custom"; item: CustomItem }
  | { type: "static"; item: Item };
type LibSection = { key: string; title?: string; data: RowData[] };

function CustomItemRow({
  item,
  onEdit,
}: {
  item: CustomItem;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const catInfo = ITEM_CATEGORIES[item.category];
  return (
    <Pressable className="flex-row items-center gap-3 py-3 px-3 rounded-card bg-background-card border border-border mb-1.5">
      <View className="w-9 h-9 rounded-lg bg-background-surface items-center justify-center">
        <Text className="text-lg">{catInfo.emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-text text-sm font-bold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-text-muted text-xs mt-0.5">
          {item.weight} lbs · {item.cost} PO
        </Text>
      </View>
      <View className="border border-border rounded-[10px] px-2 py-0.5 bg-gold/10">
        <Text className="text-gold text-[10px] font-bold">
          {t("custom_items.badge")}
        </Text>
      </View>
      <Pressable onPress={onEdit} hitSlop={8} className="pl-2">
        <Pencil size={15} color={Colors.gold} />
      </Pressable>
    </Pressable>
  );
}

function StaticItemRow({ item }: { item: Item }) {
  const rarityColor = ITEM_RARITIES[item.rarity].color;
  const rarityLabel = ITEM_RARITIES[item.rarity].label;
  const catInfo = ITEM_CATEGORIES[item.category];
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="rounded-card bg-background-card border border-border mb-1.5 overflow-hidden">
      {/* Linha principal */}
      <Pressable
        className="flex-row items-center gap-3 py-3 px-3"
        onPress={() => setExpanded((v) => !v)}
      >
        <View className="w-9 h-9 rounded-lg bg-background-surface items-center justify-center">
          <Text className="text-lg">{catInfo.emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-text text-sm font-semibold" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-text-muted text-xs mt-0.5">
            {item.weight} lbs · {item.cost} PO
          </Text>
        </View>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: rarityColor,
          }}
        />
      </Pressable>

      {/* Detalhes expansíveis */}
      {expanded && (
        <View className="px-3 pb-3 border-t border-border pt-2.5">
          {/* Raridade */}
          <View className="flex-row items-center gap-1.5 mb-2">
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: rarityColor,
              }}
            />
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: rarityColor }}
            >
              {rarityLabel}
            </Text>
          </View>

          {/* Descrição mecânica — sempre visível */}
          <Text className="text-text-muted text-sm leading-5">
            {item.description}
          </Text>

          {/* Lore desbloqueável — só para itens raros com lore */}
          {item.lore != null && (
            <LoreUnlockCard itemId={item.id} lore={item.lore} />
          )}
        </View>
      )}
    </View>
  );
}

export default function LibraryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterValue>(null);
  const [selectedItem, setSelectedItem] = useState<CustomItem | undefined>();
  const formRef = useRef<CustomItemFormRef>(null);

  const { customItems } = useCustomItems();
  const {
    items: staticItems,
    search,
    setSearch,
    setActiveCategory,
  } = useLibrary({});

  function applyFilter(f: FilterValue) {
    setFilter(f);
    setActiveCategory(f !== "custom" && f !== null ? f : null);
  }

  function openCreate() {
    setSelectedItem(undefined);
    formRef.current?.present();
  }

  function openEdit(item: CustomItem) {
    setSelectedItem(item);
    formRef.current?.present();
  }

  const filteredCustomItems = useMemo(() => {
    if (!search.trim()) return customItems;
    const q = search.trim().toLowerCase();
    return customItems.filter((ci) => ci.name.toLowerCase().includes(q));
  }, [customItems, search]);

  const sections = useMemo<LibSection[]>(() => {
    const result: LibSection[] = [];
    const showCustom =
      filter === "custom" || (filter === null && customItems.length > 0);
    if (showCustom) {
      result.push({
        key: "custom",
        title: t("custom_items.section_title"),
        data: filteredCustomItems.map(
          (item) => ({ type: "custom", item }) as RowData,
        ),
      });
    }
    if (filter !== "custom") {
      result.push({
        key: "library",
        title: showCustom ? t("library.title") : undefined,
        data: staticItems.map((item) => ({ type: "static", item }) as RowData),
      });
    }
    return result;
  }, [filter, filteredCustomItems, staticItems, customItems.length, t]);

  const filterChips = useMemo(
    () => [
      { key: "custom" as FilterValue, label: t("custom_items.filter_chip") },
      { key: null as FilterValue, label: t("library.filter_all") },
      ...Object.entries(ITEM_CATEGORIES).map(([k, v]) => ({
        key: k as FilterValue,
        label: v.label,
      })),
    ],
    [t],
  );

  const ListHeader = (
    <View>
      {/* Barra de busca */}
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t("library.search_placeholder")}
          placeholderTextColor="#8a8a9a"
          className="bg-background-surface text-text px-4 py-3 rounded-xl border border-border text-sm"
        />
      </View>

      {/* Filtros */}
      <FlatList
        horizontal
        data={filterChips}
        keyExtractor={(chip) => String(chip.key)}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
          paddingBottom: 8,
          alignItems: "center",
        }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: chip }) => {
          const sel = filter === chip.key;
          return (
            <Pressable
              onPress={() => applyFilter(chip.key)}
              className={`flex-row items-center px-3 py-1.5 rounded-chip border ${
                sel
                  ? "bg-primary border-primary"
                  : "bg-background-surface border-border"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  sel ? "text-text-inverse" : "text-text-muted"
                }`}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Lista principal com header embutido */}
      <SectionList
        style={{ flex: 1 }}
        ListHeaderComponent={ListHeader}
        sections={sections}
        keyExtractor={(item, i) => `${item.type}-${item.item.id}-${i}`}
        renderItem={({ item }) =>
          item.type === "custom" ? (
            <CustomItemRow
              item={item.item}
              onEdit={() => openEdit(item.item)}
            />
          ) : (
            <StaticItemRow item={item.item} />
          )
        }
        renderSectionHeader={({ section }) => {
          if (section.key === "custom") {
            return (
              <View>
                <View className="flex-row items-center justify-between py-2.5">
                  <Text className="text-gold text-xs font-bold tracking-widest uppercase">
                    {section.title}
                    {filteredCustomItems.length > 0
                      ? `  (${filteredCustomItems.length})`
                      : ""}
                  </Text>
                  <Pressable
                    onPress={openCreate}
                    className="flex-row items-center gap-1 border border-border rounded-chip px-2.5 py-1.5"
                  >
                    <Plus size={12} color={Colors.gold} />
                    <Text className="text-gold text-xs font-semibold">
                      {t("custom_items.create_button")}
                    </Text>
                  </Pressable>
                </View>
                {filter === "custom" && filteredCustomItems.length === 0 && (
                  <View className="items-center py-10 px-6">
                    <Text className="text-text text-base font-bold text-center mb-2">
                      {t("custom_items.empty_title")}
                    </Text>
                    <Text className="text-text-muted text-sm text-center">
                      {t("custom_items.empty_subtitle")}
                    </Text>
                  </View>
                )}
              </View>
            );
          }
          return section.title ? (
            <Text className="text-gold text-xs font-bold tracking-widest uppercase py-2.5">
              {section.title}
            </Text>
          ) : null;
        }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        stickySectionHeadersEnabled={false}
      />

      <CustomItemForm
        ref={formRef}
        item={selectedItem}
        onSave={() => {}}
        onDelete={() => {}}
      />
    </View>
  );
}
