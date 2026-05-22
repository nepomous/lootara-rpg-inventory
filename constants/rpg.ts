// ── Sistemas de RPG ───────────────────────────────────────────────────────────
export type RPGSystem = "dnd5e" | "pf1" | "pf2" | "other" | "generic";

export const RPG_SYSTEMS: Record<RPGSystem, string> = {
  dnd5e: "D&D 5e",
  pf1: "Pathfinder 1e",
  pf2: "Pathfinder 2e",
  other: "Outro sistema",
  generic: "Genérico",
};

// ── Categorias de itens ───────────────────────────────────────────────────────
export type ItemCategory =
  | "weapon"
  | "armor"
  | "gear"
  | "potion"
  | "tool"
  | "magic"
  | "ammunition"
  | "container";

export const ITEM_CATEGORIES: Record<
  ItemCategory,
  { label: string; emoji: string }
> = {
  weapon: { label: "Armas", emoji: "⚔️" },
  armor: { label: "Armaduras", emoji: "🛡️" },
  gear: { label: "Equipamentos", emoji: "🎒" },
  potion: { label: "Poções", emoji: "🧪" },
  tool: { label: "Ferramentas", emoji: "🔧" },
  magic: { label: "Itens Mágicos", emoji: "✨" },
  ammunition: { label: "Munição", emoji: "🏹" },
  container: { label: "Recipientes", emoji: "📦" },
};

// ── Raridade de itens ─────────────────────────────────────────────────────────
export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "very_rare"
  | "legendary";

export const ITEM_RARITIES: Record<
  ItemRarity,
  { label: string; color: string }
> = {
  common: { label: "Comum", color: "#9ca3af" },
  uncommon: { label: "Incomum", color: "#22c55e" },
  rare: { label: "Raro", color: "#3b82f6" },
  very_rare: { label: "Muito Raro", color: "#a855f7" },
  legendary: { label: "Lendário", color: "#f59e0b" },
};

// ── Localização de item na sacola ─────────────────────────────────────────────
export type BagItemLocation = "equipped" | "backpack" | "stored";

export const BAG_LOCATIONS: Record<
  BagItemLocation,
  { label: string; emoji: string }
> = {
  equipped: { label: "Equipado", emoji: "🧍" },
  backpack: { label: "Na mochila", emoji: "🎒" },
  stored: { label: "Guardado", emoji: "📦" },
};

// ── Classes de personagem ─────────────────────────────────────────────────────
export type CharacterClass =
  | "barbarian"
  | "bard"
  | "cleric"
  | "druid"
  | "fighter"
  | "monk"
  | "paladin"
  | "ranger"
  | "rogue"
  | "sorcerer"
  | "warlock"
  | "wizard"
  | "alchemist"
  | "champion"
  | "investigator"
  | "oracle"
  | "swashbuckler"
  | "witch"
  | "other";

export const CHARACTER_CLASSES: Record<
  CharacterClass,
  { label: string; emoji: string }
> = {
  barbarian: { label: "Bárbaro", emoji: "🪓" },
  bard: { label: "Bardo", emoji: "🎵" },
  cleric: { label: "Clérigo", emoji: "⛪" },
  druid: { label: "Druida", emoji: "🌿" },
  fighter: { label: "Guerreiro", emoji: "⚔️" },
  monk: { label: "Monge", emoji: "🥋" },
  paladin: { label: "Paladino", emoji: "🛡️" },
  ranger: { label: "Patrulheiro", emoji: "🏹" },
  rogue: { label: "Ladino", emoji: "🗡️" },
  sorcerer: { label: "Feiticeiro", emoji: "🔮" },
  warlock: { label: "Bruxo", emoji: "👁️" },
  wizard: { label: "Mago", emoji: "🧙" },
  alchemist: { label: "Alquimista", emoji: "⚗️" },
  champion: { label: "Campeão", emoji: "🏆" },
  investigator: { label: "Investigador", emoji: "🔍" },
  oracle: { label: "Oráculo", emoji: "🌟" },
  swashbuckler: { label: "Duelista", emoji: "🤺" },
  witch: { label: "Bruxa", emoji: "🧹" },
  other: { label: "Outro", emoji: "🎭" },
};

// ── Raças de personagem ───────────────────────────────────────────────────────
export type CharacterRace =
  | "human"
  | "elf"
  | "dwarf"
  | "halfling"
  | "gnome"
  | "half_elf"
  | "half_orc"
  | "tiefling"
  | "dragonborn"
  | "aasimar"
  | "goliath"
  | "orc"
  | "goblin"
  | "kobold"
  | "other";

export const CHARACTER_RACES: Record<
  CharacterRace,
  { label: string; emoji: string }
> = {
  human: { label: "Humano", emoji: "👤" },
  elf: { label: "Elfo", emoji: "🧝" },
  dwarf: { label: "Anão", emoji: "⛏️" },
  halfling: { label: "Halfling", emoji: "🦶" },
  gnome: { label: "Gnomo", emoji: "🍄" },
  half_elf: { label: "Meio-Elfo", emoji: "🌗" },
  half_orc: { label: "Meio-Orc", emoji: "💪" },
  tiefling: { label: "Tiefling", emoji: "😈" },
  dragonborn: { label: "Draconato", emoji: "🐉" },
  aasimar: { label: "Aasimar", emoji: "😇" },
  goliath: { label: "Golias", emoji: "🏔️" },
  orc: { label: "Orc", emoji: "🟢" },
  goblin: { label: "Goblin", emoji: "👺" },
  kobold: { label: "Kobold", emoji: "🦎" },
  other: { label: "Outra", emoji: "❓" },
};

// ── Nível de personagem ───────────────────────────────────────────────────────
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 20;

// ─────────────────────────────────────────────────────────────────────────────
// CLASSES E RAÇAS POR SISTEMA
// Todas as listas são imutáveis em runtime (as const).
// Use getClassesBySystem() e getRacesBySystem() — nunca acesse as listas diretamente.
// ─────────────────────────────────────────────────────────────────────────────

// ─── D&D 5e — PHB 2014 + PHB 2024 ────────────────────────────────────────────
export const DND5E_CLASSES = [
  { id: "barbarian",  label: "Bárbaro",     emoji: "🪓" },
  { id: "bard",       label: "Bardo",       emoji: "🎵" },
  { id: "cleric",     label: "Clérigo",     emoji: "✝️" },
  { id: "druid",      label: "Druida",      emoji: "🌿" },
  { id: "fighter",    label: "Guerreiro",   emoji: "⚔️" },
  { id: "monk",       label: "Monge",       emoji: "👊" },
  { id: "paladin",    label: "Paladino",    emoji: "🛡️" },
  { id: "ranger",     label: "Patrulheiro", emoji: "🏹" },
  { id: "rogue",      label: "Ladino",      emoji: "🗡️" },
  { id: "sorcerer",   label: "Feiticeiro",  emoji: "✨" },
  { id: "warlock",    label: "Bruxo",       emoji: "💀" },
  { id: "wizard",     label: "Mago",        emoji: "🔮" },
] as const;

// PHB 2014 (9 raças core) + PHB 2024 (10 raças core) + suplementos comuns
export const DND5E_RACES = [
  "Humano", "Elfo", "Anão", "Halfling", "Gnomo", "Draconato",
  "Meio-Elfo", "Meio-Orc", "Tiefling",
  "Aasimar", "Goliath", "Orc",
  "Aarakocra", "Genasi", "Firbolg", "Tabaxi", "Tortle", "Kenku",
  "Lizardfolk", "Yuan-ti Pureblood", "Outro",
] as const;

// ─── Pathfinder 1e — Core, Base, Hybrid, Occult, Alternate ──────────────────
// Fonte: d20pfsrd.com, Archives of Nethys Legacy
export const PF1E_CLASSES = [
  // Core Rulebook
  { id: "barbarian",    label: "Bárbaro",           emoji: "🪓",    group: "Core" },
  { id: "bard",         label: "Bardo",             emoji: "🎵",    group: "Core" },
  { id: "cleric",       label: "Clérigo",           emoji: "✝️",    group: "Core" },
  { id: "druid",        label: "Druida",            emoji: "🌿",    group: "Core" },
  { id: "fighter",      label: "Guerreiro",         emoji: "⚔️",    group: "Core" },
  { id: "monk",         label: "Monge",             emoji: "👊",    group: "Core" },
  { id: "paladin",      label: "Paladino",          emoji: "🛡️",    group: "Core" },
  { id: "ranger",       label: "Ranger",            emoji: "🏹",    group: "Core" },
  { id: "rogue",        label: "Ladino",            emoji: "🗡️",    group: "Core" },
  { id: "sorcerer",     label: "Feiticeiro",        emoji: "✨",    group: "Core" },
  { id: "wizard",       label: "Mago",              emoji: "🔮",    group: "Core" },
  // Base (Advanced Player's Guide)
  { id: "alchemist",    label: "Alquimista",        emoji: "⚗️",    group: "Base" },
  { id: "cavalier",     label: "Cavaleiro",         emoji: "🐴",    group: "Base" },
  { id: "gunslinger",   label: "Pistoleiro",        emoji: "🔫",    group: "Base" },
  { id: "inquisitor",   label: "Inquisidor",        emoji: "⚖️",    group: "Base" },
  { id: "magus",        label: "Magus",             emoji: "🔮",    group: "Base" },
  { id: "oracle",       label: "Oráculo",           emoji: "👁️",    group: "Base" },
  { id: "summoner",     label: "Invocador",         emoji: "🌀",    group: "Base" },
  { id: "witch",        label: "Bruxa",             emoji: "🧙",    group: "Base" },
  // Hybrid (Advanced Class Guide)
  { id: "arcanist",     label: "Arcanista",         emoji: "📖",    group: "Híbrida" },
  { id: "bloodrager",   label: "Bloodrager",        emoji: "🩸",    group: "Híbrida" },
  { id: "brawler",      label: "Brigão",            emoji: "👊",    group: "Híbrida" },
  { id: "hunter",       label: "Caçador",           emoji: "🐾",    group: "Híbrida" },
  { id: "investigator", label: "Investigador",      emoji: "🔍",    group: "Híbrida" },
  { id: "shaman",       label: "Xamã",              emoji: "🔥",    group: "Híbrida" },
  { id: "skald",        label: "Skald",             emoji: "📯",    group: "Híbrida" },
  { id: "slayer",       label: "Matador",           emoji: "🎯",    group: "Híbrida" },
  { id: "swashbuckler", label: "Espadachim",        emoji: "🤺",    group: "Híbrida" },
  { id: "warpriest",    label: "Clérigo de Guerra", emoji: "✝️",    group: "Híbrida" },
  // Occult (Occult Adventures)
  { id: "kineticist",   label: "Cinético",          emoji: "💨",    group: "Ocultista" },
  { id: "medium",       label: "Médium",            emoji: "👻",    group: "Ocultista" },
  { id: "mesmerist",    label: "Mesmerista",        emoji: "🌀",    group: "Ocultista" },
  { id: "occultist",    label: "Ocultista",         emoji: "🔯",    group: "Ocultista" },
  { id: "psychic",      label: "Psíquico",          emoji: "🧠",    group: "Ocultista" },
  { id: "spiritualist", label: "Espiritualista",    emoji: "💫",    group: "Ocultista" },
  // Alternate Classes
  { id: "antipaladin",  label: "Antipaladino",      emoji: "💀",    group: "Alternativa" },
  { id: "ninja",        label: "Ninja",             emoji: "🥷",    group: "Alternativa" },
  { id: "samurai",      label: "Samurai",           emoji: "⛩️",    group: "Alternativa" },
] as const;

// Raças PF1e — Core + suplementos oficiais Paizo
export const PF1E_RACES = [
  "Humano", "Elfo", "Anão", "Halfling", "Gnomo", "Meio-Elfo", "Meio-Orc",
  "Goblin", "Hobgoblin", "Kobold", "Orc", "Dhampir",
  "Ifrit", "Oread", "Sylph", "Undine",
  "Aasimar", "Tiefling", "Kitsune", "Nagaji", "Samsaran", "Tengu",
  "Wayang", "Catfolk", "Changeling", "Fetchling", "Grippli",
  "Merfolk", "Ratfolk", "Strix", "Suli", "Vishkanya", "Outro",
] as const;

// ─── Pathfinder 2e — Player Core, GM Core ────────────────────────────────────
// Fonte: Archives of Nethys 2e (2e.aonprd.com)
// "Ancestral" é o termo oficial do PF2e para raças
export const PF2E_CLASSES = [
  { id: "alchemist",    label: "Alquimista",   emoji: "⚗️"  },
  { id: "animist",      label: "Animista",     emoji: "🌳"  },
  { id: "barbarian",    label: "Bárbaro",      emoji: "🪓"  },
  { id: "bard",         label: "Bardo",        emoji: "🎵"  },
  { id: "champion",     label: "Campeão",      emoji: "🛡️"  },
  { id: "cleric",       label: "Clérigo",      emoji: "✝️"  },
  { id: "druid",        label: "Druida",       emoji: "🌿"  },
  { id: "exemplar",     label: "Exemplar",     emoji: "⭐"  },
  { id: "fighter",      label: "Guerreiro",    emoji: "⚔️"  },
  { id: "gunslinger",   label: "Pistoleiro",   emoji: "🔫"  },
  { id: "inventor",     label: "Inventor",     emoji: "⚙️"  },
  { id: "investigator", label: "Investigador", emoji: "🔍"  },
  { id: "kineticist",   label: "Cinético",     emoji: "💨"  },
  { id: "magus",        label: "Magus",        emoji: "🔮"  },
  { id: "monk",         label: "Monge",        emoji: "👊"  },
  { id: "oracle",       label: "Oráculo",      emoji: "👁️"  },
  { id: "psychic",      label: "Psíquico",     emoji: "🧠"  },
  { id: "ranger",       label: "Ranger",       emoji: "🏹"  },
  { id: "rogue",        label: "Ladino",       emoji: "🗡️"  },
  { id: "sorcerer",     label: "Feiticeiro",   emoji: "✨"  },
  { id: "summoner",     label: "Invocador",    emoji: "🌀"  },
  { id: "swashbuckler", label: "Espadachim",   emoji: "🤺"  },
  { id: "thaumaturge",  label: "Taumaturgo",   emoji: "🔯"  },
  { id: "witch",        label: "Bruxa",        emoji: "🧙"  },
  { id: "wizard",       label: "Mago",         emoji: "🔮"  },
] as const;

// Ancestrais PF2e — Player Core + suplementos
export const PF2E_RACES = [
  "Humano", "Elfo", "Anão", "Gnomo", "Goblin", "Halfling",
  "Leshy", "Ysoki (Ratfolk)", "Tengu", "Kobold", "Orc", "Hobgoblin",
  "Lizardfolk", "Shoony", "Sprite", "Fetchling", "Automaton",
  "Fleshwarp", "Grippli", "Amurruni (Catfolk)", "Android",
  "Skeleton", "Strix", "Vanara", "Kitsune", "Outro",
] as const;

// ─── Sistema Genérico / Other ─────────────────────────────────────────────────
export const OTHER_CLASSES = [
  { id: "warrior", label: "Guerreiro", emoji: "⚔️" },
  { id: "mage",    label: "Mago",      emoji: "🔮" },
  { id: "rogue",   label: "Ladino",    emoji: "🗡️" },
  { id: "cleric",  label: "Clérigo",   emoji: "✝️" },
  { id: "other",   label: "Outro",     emoji: "🎲" },
] as const;

export const OTHER_RACES = ["Humano", "Elfo", "Anão", "Outro"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getClassesBySystem(system: RPGSystem) {
  switch (system) {
    case "dnd5e":   return DND5E_CLASSES;
    case "pf1":     return PF1E_CLASSES;
    case "pf2":     return PF2E_CLASSES;
    default:        return OTHER_CLASSES;
  }
}

export function getRacesBySystem(system: RPGSystem): readonly string[] {
  switch (system) {
    case "dnd5e":   return DND5E_RACES;
    case "pf1":     return PF1E_RACES;
    case "pf2":     return PF2E_RACES;
    default:        return OTHER_RACES;
  }
}

// PF2e usa "Ancestral" oficialmente no lugar de "Raça"
export function getRaceLabel(system: RPGSystem): string {
  return system === "pf2" ? "Ancestral" : "Raça";
}
