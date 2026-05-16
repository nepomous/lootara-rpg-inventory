// ============================================================
// Lootara — Design System Tokens
// Dark fantasy theme. No light mode — dark only.
// ============================================================

// ------------------------------------------------------------
// Colors
// ------------------------------------------------------------
export const Colors = {
  // Backgrounds
  background: "#0d0d1a", // App background
  surface: "#1a1a2e", // Cards, painéis, bottom nav
  surfaceElevated: "#22223a", // Cards elevados

  // Texto
  parchment: "#f5f0e0", // Texto primário
  mutedForeground: "#8a8a9a", // Texto secundário, placeholders

  // Accents
  gold: "#c9a84c", // Accent principal, ícones, estados ativos
  goldSoft: "#dcc080", // Gold suave para highlights

  // Semânticas
  crimson: "#8b1a1a", // Destrutivo, avisos, FAB

  // Raridade de itens
  rarity: {
    common: "#a8a8a8",
    uncommon: "#5ca05c",
    rare: "#5c8ac8",
    veryRare: "#8a5cc8",
    legendary: "#c8a85c",
  },

  // Bordas (gold com opacidade)
  borderSubtle: "rgba(201,168,76,0.15)",
  borderDefault: "rgba(201,168,76,0.30)",
} as const;

// ------------------------------------------------------------
// Gradients (para uso com expo-linear-gradient)
// ------------------------------------------------------------
export const Gradients = {
  gold: {
    colors: ["#dcc080", "#b8953c"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  tome: {
    colors: ["#22223a", "#0d0d1a"],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  },
} as const;

// ------------------------------------------------------------
// Shadows
// ------------------------------------------------------------
export const Shadows = {
  goldGlow: {
    shadowColor: "#c9a84c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ------------------------------------------------------------
// Typography
// ------------------------------------------------------------
export const Typography = {
  display: {
    fontFamily: "Cinzel_700Bold",
    letterSpacing: 3,
    textTransform: "uppercase" as const,
  },
  displayMd: {
    fontFamily: "Cinzel_400Regular",
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  body: {
    fontFamily: "Nunito_400Regular",
  },
  bodySemiBold: {
    fontFamily: "Nunito_600SemiBold",
  },
  bodyBold: {
    fontFamily: "Nunito_700Bold",
  },
} as const;

// ------------------------------------------------------------
// Spacing
// ------------------------------------------------------------
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

// ------------------------------------------------------------
// Border Radius
// ------------------------------------------------------------
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
