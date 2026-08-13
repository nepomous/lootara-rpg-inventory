import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ITEMS } from "@/constants/items";
import type { Item, ItemCategory } from "@/constants/items";
import type { RPGSystem } from "@/constants/rpg";
import { useCustomItems } from "@/hooks/useCustomItems";

export type LibraryItem = Item & { isCustom?: boolean };

type UseLibraryOptions = {
  system?: RPGSystem;
  includeCustom?: boolean;
};

export function useLibrary({
  system,
  includeCustom = true,
}: UseLibraryOptions = {}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ItemCategory | null>(
    null,
  );
  const { customItems } = useCustomItems();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const customFiltered: LibraryItem[] = (includeCustom ? customItems : [])
      .filter((ci) => {
        if (activeCategory && ci.category !== activeCategory) return false;
        if (q && !ci.name.toLowerCase().includes(q)) return false;
        return true;
      })
      .map((ci) => ({
        id: ci.id,
        name: ci.name,
        category: ci.category,
        weight: ci.weight,
        cost: ci.cost,
        description: ci.description ?? "",
        rarity: ci.rarity,
        system: ["generic"] as RPGSystem[],
        isCustom: true,
      }));

    const staticFiltered: LibraryItem[] = ITEMS.filter((item) => {
      // Filtro de sistema: mostra genéricos + os do sistema selecionado
      if (system && system !== "other") {
        const matchesSystem =
          item.system.includes("generic") || item.system.includes(system);
        if (!matchesSystem) return false;
      }

      // Filtro de categoria
      if (activeCategory && item.category !== activeCategory) return false;

      // Filtro de busca (nome traduzido, case-insensitive)
      if (q) {
        const translatedName = t(`items.${item.id}.name`, {
          defaultValue: item.name,
        });
        if (!translatedName.toLowerCase().includes(q)) return false;
      }

      return true;
    });

    // Custom items aparecem primeiro na lista
    return [...customFiltered, ...staticFiltered];
  }, [system, activeCategory, search, t, customItems]);

  return {
    items: filtered,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
  };
}

export type { Item, ItemCategory };
