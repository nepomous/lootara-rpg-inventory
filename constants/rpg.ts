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
