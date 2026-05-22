import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import {
  getBagItems,
  addBagItem,
  updateBagItem,
  removeBagItem,
  getCustomItemById,
} from "@/db/index";
import type { BagItem, NewBagItem, BagItemLocation } from "@/db/schema";
import type { ItemCategory, ItemRarity } from "@/constants/rpg";
import { getItemById } from "@/constants/items";
import { calcCarriedWeight } from "@/utils/weight";

export const bagQueryKey = (characterId: string) =>
  ["bag", characterId] as const;

// ── Tipo unificado: BagItem + dados do item (estático ou custom) ──────────────
export type BagItemWithDetails = BagItem & {
  itemName: string;
  itemCategory: ItemCategory;
  itemWeight: number;
  itemCost: number;
  itemDescription: string;
  itemRarity: ItemRarity;
  itemMagicBonus: number;
  itemSystemMeta: string | null;
};

// ── Tipos de entrada para mutations ──────────────────────────────────────────
export type AddBagItemInput = {
  characterId: string;
  itemId: string | null;
  customName: string | null;
  isCustom?: boolean;
  quantity: number;
  location: BagItemLocation;
  notes?: string;
  // Metadados de sistema (itens da biblioteca)
  description?: string | null;
  rarity?: ItemRarity | null;
  magicBonus?: number;
  systemMeta?: string | null;
};

export type UpdateBagItemInput = {
  quantity?: number;
  location?: BagItemLocation;
  notes?: string;
  description?: string | null;
  rarity?: ItemRarity | null;
  magicBonus?: number;
  systemMeta?: string | null;
};

// ── Helpers internos ──────────────────────────────────────────────────────────
function enrichBagItem(bi: BagItem): BagItemWithDetails {
  if (bi.isCustom) {
    const custom = bi.itemId ? getCustomItemById(bi.itemId) : null;
    return {
      ...bi,
      itemName: custom?.name ?? bi.customName ?? "Item personalizado",
      itemCategory: (custom?.category ?? "gear") as ItemCategory,
      itemWeight: custom?.weight ?? 0,
      itemCost: custom?.cost ?? 0,
      itemDescription: custom?.description ?? "",
      itemRarity: (custom?.rarity ?? "common") as ItemRarity,
      itemMagicBonus: custom?.magicBonus ?? 0,
      itemSystemMeta: custom?.systemMeta ?? null,
    };
  }
  const staticItem = bi.itemId ? getItemById(bi.itemId) : null;
  return {
    ...bi,
    itemName: staticItem?.name ?? bi.customName ?? "Item personalizado",
    itemCategory: (staticItem?.category ?? "gear") as ItemCategory,
    itemWeight: staticItem?.weight ?? 0,
    itemCost: staticItem?.cost ?? 0,
    // Prefer bag-level overrides; fall back to static item values
    itemDescription: bi.description ?? staticItem?.description ?? "",
    itemRarity: (bi.rarity ?? staticItem?.rarity ?? "common") as ItemRarity,
    itemMagicBonus: bi.magicBonus ?? 0,
    itemSystemMeta: bi.systemMeta ?? null,
  };
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useBag(characterId: string) {
  const query = useQuery({
    queryKey: bagQueryKey(characterId),
    queryFn: (): BagItemWithDetails[] =>
      getBagItems(characterId).map(enrichBagItem),
    enabled: !!characterId,
  });

  const carriedWeight = calcCarriedWeight(query.data ?? []);

  return { ...query, carriedWeight };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useAddBagItem(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddBagItemInput) => {
      const data: Omit<NewBagItem, "createdAt" | "updatedAt"> = {
        id: randomUUID(),
        characterId: input.characterId,
        itemId: input.itemId,
        customName: input.customName,
        isCustom: input.isCustom ? 1 : 0,
        quantity: input.quantity,
        location: input.location,
        notes: input.notes ?? null,
        description: input.description ?? null,
        rarity: input.rarity ?? null,
        magicBonus: input.magicBonus ?? 0,
        systemMeta: input.systemMeta ?? null,
      };
      return Promise.resolve(addBagItem(data));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: bagQueryKey(characterId),
      });
    },
  });
}

export function useUpdateBagItem(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBagItemInput }) =>
      Promise.resolve(updateBagItem(id, data)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: bagQueryKey(characterId),
      });
    },
  });
}

export function useRemoveBagItem(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Promise.resolve(removeBagItem(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: bagQueryKey(characterId),
      });
    },
  });
}

export type { BagItem };
