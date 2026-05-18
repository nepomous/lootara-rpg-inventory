import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ──────────────────────────────────
        background: "#0d0d1a",
        surface: "#1a1a2e",
        "surface-elevated": "#22223a",
        // aliases usados nos componentes (background-card / background-surface)
        "background-card": "#1a1a2e", // = surface (fundo de cards)
        "background-surface": "#22223a", // = surface-elevated (inputs, chips)
        // ── Texto ────────────────────────────────────────
        parchment: "#f5f0e0",
        muted: "#8a8a9a",
        // ── Accents ──────────────────────────────────────
        gold: "#c9a84c",
        "gold-soft": "#dcc080",
        // ── Semânticas ───────────────────────────────────
        crimson: "#8b1a1a",
        // ── Raridade de itens ────────────────────────────
        rarity: {
          common: "#a8a8a8",
          uncommon: "#5ca05c",
          rare: "#5c8ac8",
          "very-rare": "#8a5cc8",
          legendary: "#c8a85c",
        },
        // ── Aliases semânticos usados nos componentes ────────
        text: "#f5f0e0", // = parchment (texto primário)
        "text-muted": "#8a8a9a", // = muted (texto secundário)
        "text-inverse": "#0d0d1a", // = background (texto sobre fundos claros)
        primary: "#c9a84c", // = gold (accent principal)
        secondary: "#c9a84c", // = gold (accent secundário)
        // ── Legado (mantido para não quebrar telas existentes) ──
        border: "rgba(201,168,76,0.30)",
        error: "#8b1a1a",
        success: "#5ca05c",
      },
      borderRadius: {
        chip: "20px", // pílulas/chips
        card: "12px", // cards
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      fontFamily: {
        cinzel: ["Cinzel_700Bold"],
        "cinzel-regular": ["Cinzel_400Regular"],
        nunito: ["Nunito_400Regular"],
        "nunito-semibold": ["Nunito_600SemiBold"],
        "nunito-bold": ["Nunito_700Bold"],
      },
    },
  },
  plugins: [],
};

export default config;
