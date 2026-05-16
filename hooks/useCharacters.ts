import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "@/db/index";
import type { Character, NewCharacter, RPGSystem } from "@/db/schema";

export const CHARACTERS_QUERY_KEY = ["characters"] as const;

// ── Tipos de entrada para mutations ──────────────────────────────────────────
export type CreateCharacterInput = {
  name: string;
  class: string;
  race: string;
  level: number;
  system: RPGSystem;
  avatarEmoji?: string;
};

export type UpdateCharacterInput = Partial<CreateCharacterInput>;

// ── Queries ───────────────────────────────────────────────────────────────────

export function useCharacters() {
  return useQuery({
    queryKey: CHARACTERS_QUERY_KEY,
    queryFn: getCharacters,
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: [...CHARACTERS_QUERY_KEY, id],
    queryFn: () => getCharacterById(id),
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCharacterInput) => {
      const data: Omit<NewCharacter, "createdAt" | "updatedAt"> = {
        id: randomUUID(),
        name: input.name,
        class: input.class,
        race: input.race,
        level: input.level,
        system: input.system,
        avatarEmoji: input.avatarEmoji ?? null,
      };
      return Promise.resolve(createCharacter(data));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_QUERY_KEY });
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCharacterInput }) =>
      Promise.resolve(updateCharacter(id, data)),
    onSuccess: (updated: Character) => {
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: [...CHARACTERS_QUERY_KEY, updated.id],
      });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => Promise.resolve(deleteCharacter(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CHARACTERS_QUERY_KEY });
    },
  });
}
