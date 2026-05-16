import { useMemo, useState } from "react";
import { ITEMS } from "@/constants/items";
import type { Item, ItemCategory } from "@/constants/items";
import type { RPGSystem } from "@/db/schema";

type UseLibraryOptions = {
  system?: RPGSystem;
};

export function useLibrary({ system }: UseLibraryOptions = {}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ItemCategory | null>(
    null,
  );

  const filtered = useMemo(() => {
    return ITEMS.filter((item) => {
      // Filtro de sistema: mostra genéricos + os do sistema selecionado
      if (system && system !== "other") {
        const matchesSystem =
          item.system.includes("generic") || item.system.includes(system);
        if (!matchesSystem) return false;
      }

      // Filtro de categoria
      if (activeCategory && item.category !== activeCategory) return false;

      // Filtro de busca (nome, case-insensitive)
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!item.name.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [system, activeCategory, search]);

  return {
    items: filtered,
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
  };
}

export type { Item, ItemCategory };
