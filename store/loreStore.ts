import { create } from "zustand";

interface LoreState {
  revealedLore: Record<string, boolean>;
  revealLore: (itemId: string) => void;
}

// Estado de sessão: lore desbloqueado via rewarded ad persiste até o app ser fechado.
// Premium users sempre veem o lore sem passar pelo store.
export const useLoreStore = create<LoreState>((set) => ({
  revealedLore: {},
  revealLore: (itemId) =>
    set((state) => ({
      revealedLore: { ...state.revealedLore, [itemId]: true },
    })),
}));
