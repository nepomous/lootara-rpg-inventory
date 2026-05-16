import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // ── Fundos ──────────────────────────────────────
        background: {
          DEFAULT: "#1a1a2e", // azul-noite profundo (fundo principal)
          card: "#16213e", // azul-noite médio (cards)
          surface: "#0f3460", // azul-noite claro (superfícies elevadas)
        },
        // ── Primária — dourado RPG ───────────────────────
        primary: {
          DEFAULT: "#e8c547", // dourado principal
          light: "#f5d96b", // dourado claro
          dark: "#c9a832", // dourado escuro
          foreground: "#1a1a2e",
        },
        // ── Secundária — vermelho sangue ─────────────────
        secondary: {
          DEFAULT: "#c84b31", // vermelho sangue
          light: "#e05a3a",
          dark: "#a33a22",
          foreground: "#ffffff",
        },
        // ── Texto ────────────────────────────────────────
        text: {
          DEFAULT: "#e8e8e8", // branco suave (texto principal)
          muted: "#9ca3af", // cinza médio (texto secundário)
          inverse: "#1a1a2e", // texto sobre fundo claro
        },
        // ── Raridade de itens ────────────────────────────
        rarity: {
          common: "#9ca3af",
          uncommon: "#22c55e",
          rare: "#3b82f6",
          very_rare: "#a855f7",
          legendary: "#f59e0b",
        },
        // ── Localização de itens ─────────────────────────
        location: {
          equipped: "#22c55e",
          backpack: "#3b82f6",
          stored: "#9ca3af",
        },
        // ── UI auxiliar ──────────────────────────────────
        border: "#0f3460",
        error: "#ef4444",
        success: "#22c55e",
        warning: "#f59e0b",
      },
      fontFamily: {
        // Usa as fontes do sistema por padrão (sem custom fonts no MVP)
        sans: ["System"],
        mono: ["SpaceMono"],
      },
      borderRadius: {
        card: "12px",
        chip: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
