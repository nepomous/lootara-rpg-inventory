import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import {
  getCustomItems,
  createCustomItem,
  updateCustomItem,
  deleteCustomItem,
} from "@/db/index";
import type { CustomItem, NewCustomItem } from "@/db/schema";

export const CUSTOM_ITEMS_QUERY_KEY = ["custom_items"] as const;

export type CreateCustomItemInput = Omit<
  NewCustomItem,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateCustomItemInput = Partial<
  Omit<NewCustomItem, "id" | "createdAt" | "updatedAt">
>;

export function useCustomItems() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CUSTOM_ITEMS_QUERY_KEY,
    queryFn: () => getCustomItems(),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCustomItemInput) =>
      Promise.resolve(createCustomItem({ id: randomUUID(), ...input })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOM_ITEMS_QUERY_KEY });
      // Invalida todas as sacolas pois um novo item pode ser adicionado
      void queryClient.invalidateQueries({ queryKey: ["bag"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomItemInput }) =>
      Promise.resolve(updateCustomItem(id, data)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOM_ITEMS_QUERY_KEY });
      // Invalida sacolas que podem ter dados enriquecidos desatualizados
      void queryClient.invalidateQueries({ queryKey: ["bag"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve(deleteCustomItem(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CUSTOM_ITEMS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["bag"] });
    },
  });

  return {
    customItems: query.data ?? [],
    isLoading: query.isLoading,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    createItemAsync: createMutation.mutateAsync,
    updateItemAsync: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export type { CustomItem };
