import { create } from "zustand";

interface PremiumState {
  isPremium: boolean;
  setIsPremium: (value: boolean) => void;
}

// Estado global mínimo: apenas status premium.
// Dados de domínio (personagens, itens) ficam no banco via React Query.
export const usePremiumStore = create<PremiumState>((set) => ({
  isPremium: false,
  setIsPremium: (value) => set({ isPremium: value }),
}));
