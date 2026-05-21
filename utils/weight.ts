import { getItemById } from "@/constants/items";
import { getCustomItemById } from "@/db/index";
import type { BagItem } from "@/db/schema";

// Peso carregado = soma de weight × quantity dos itens com location !== 'stored'
// Suporta itens da biblioteca estática (isCustom = 0) e itens customizados (isCustom = 1)
export function calcCarriedWeight(bagItems: BagItem[]): number {
  return bagItems
    .filter((bi) => bi.location !== "stored")
    .reduce((sum, bi) => {
      let weight = 0;
      if (bi.isCustom) {
        const custom = bi.itemId ? getCustomItemById(bi.itemId) : null;
        weight = custom?.weight ?? 0;
      } else {
        const staticItem = bi.itemId ? getItemById(bi.itemId) : null;
        weight = staticItem?.weight ?? 0;
      }
      return sum + weight * bi.quantity;
    }, 0);
}

// Capacidade de carga padrão D&D 5e: STR × 15 lbs
// Se STR não informado, usa 75 lbs (STR 10) como padrão
export function calcCarryCapacity(strengthScore = 10): number {
  return strengthScore * 15;
}

// Formata peso para exibição (ex: 12.5 → "12.5 lbs")
export function formatWeight(lbs: number): string {
  const rounded = Math.round(lbs * 10) / 10;
  return `${rounded} lb${rounded !== 1 ? "s" : ""}`;
}
