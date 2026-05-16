import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import {
  getBagItems,
  addBagItem,
  updateBagItem,
  removeBagItem,
} from "@/db/index";
import type { BagItem, NewBagItem, BagItemLocation } from "@/db/schema";
import { calcCarriedWeight } from "@/utils/weight";

export const bagQueryKey = (characterId: string) =>
  ["bag", characterId] as const;

// ── Tipos de entrada para mutations ──────────────────────────────────────────
export type AddBagItemInput = {
  characterId: string;
  itemId: string | null;
  customName: string | null;
  quantity: number;
  location: BagItemLocation;
  notes?: string;
};

export type UpdateBagItemInput = {
  quantity?: number;
  location?: BagItemLocation;
  notes?: string;
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useBag(characterId: string) {
  const query = useQuery({
    queryKey: bagQueryKey(characterId),
    queryFn: () => getBagItems(characterId),
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
        quantity: input.quantity,
        location: input.location,
        notes: input.notes ?? null,
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
