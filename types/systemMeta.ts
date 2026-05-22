import { z } from "zod";
import type { RPGSystem } from "@/constants/rpg";

// ───────────────────────────────────────────────────────────────────────────────
// D&D 5e — fonte: SRD 5.1, PHB 2024
// Raridade: Common, Uncommon, Rare, Very Rare, Legendary
// Attunement: vínculo mágico — máximo 3 itens por personagem
// Magic Bonus: +1 a +3 em armas e armaduras
// ───────────────────────────────────────────────────────────────────────────────
export type DnD5eMeta = {
  attunement: boolean;
  attunementPrereq?: string; // ex: "apenas conjuradores"
  charges?: number; // cargas do item (varinhas, cajados)
  recharge?: string; // ex: "1d6+1 ao amanhecer"
  cursed?: boolean;
};

// ───────────────────────────────────────────────────────────────────────────────
// Pathfinder 1e — fonte: d20pfsrd.com, Archives of Nethys Legacy
// Aura: escola de magia revelada por detect magic
// CL (Caster Level): determina potência, save DCs e resistência a dispel
// Slot: local do corpo onde o item deve ser usado (slot economy)
// Enhancement Bonus: +1 a +5 (separado do magicBonus genérico)
// Activation: como o item é ativado
// ───────────────────────────────────────────────────────────────────────────────
export type PF1eMeta = {
  casterLevel?: number;
  auraStrength?: "faint" | "moderate" | "strong" | "overwhelming";
  auraSchool?:
    | "abjuration"
    | "conjuration"
    | "divination"
    | "enchantment"
    | "evocation"
    | "illusion"
    | "necromancy"
    | "transmutation"
    | "universal";
  slot?:
    | "head"
    | "headband"
    | "eyes"
    | "shoulders"
    | "neck"
    | "chest"
    | "body"
    | "armor"
    | "belt"
    | "wrists"
    | "hands"
    | "ring"
    | "feet"
    | "slotless";
  activationType?:
    | "continuous"
    | "use-activated"
    | "command-word"
    | "spell-trigger"
    | "spell-completion";
};

// ───────────────────────────────────────────────────────────────────────────────
// Pathfinder 2e — fonte: Archives of Nethys 2e, GM Core
// Item Level: 1–25, principal medidor de poder (não raridade)
// Rarity: Common, Uncommon, Rare, Unique
// Runes: sistema de gravação de magia em itens
//   Fundamental: potency rune (+1/+2/+3) e striking/resilient
//   Property: efeitos adicionais (flaming, keen, ghost touch...)
// Bulk: L (leve), 1, 2, 3... substitui sistema de peso em lbs
// Invested: alguns itens precisam ser investidos (máx 10/dia)
// ───────────────────────────────────────────────────────────────────────────────
export type PF2eMeta = {
  itemLevel: number; // obrigatório em PF2e, 1–25
  traits?: string[]; // ex: ['magical', 'invested', 'transmutation']
  bulk?: "L" | number;
  potencyRune?: 0 | 1 | 2 | 3;
  strikingRune?: "striking" | "greater striking" | "major striking" | null;
  resilientRune?: "resilient" | "greater resilient" | "major resilient" | null;
  propertyRunes?: string[]; // ex: ['flaming', 'keen'] — máx conforme potency
  invested?: boolean;
};

export type SystemMeta = DnD5eMeta | PF1eMeta | PF2eMeta | null;

// ── Schemas Zod correspondentes ───────────────────────────────────────────────

export const dnd5eMetaSchema = z.object({
  attunement: z.boolean().default(false),
  attunementPrereq: z.string().max(100).optional(),
  charges: z.number().int().min(0).max(99).optional(),
  recharge: z.string().max(80).optional(),
  cursed: z.boolean().optional(),
});

export const pf1eMetaSchema = z.object({
  casterLevel: z.number().int().min(1).max(30).optional(),
  auraStrength: z
    .enum(["faint", "moderate", "strong", "overwhelming"])
    .optional(),
  auraSchool: z
    .enum([
      "abjuration",
      "conjuration",
      "divination",
      "enchantment",
      "evocation",
      "illusion",
      "necromancy",
      "transmutation",
      "universal",
    ])
    .optional(),
  slot: z
    .enum([
      "head",
      "headband",
      "eyes",
      "shoulders",
      "neck",
      "chest",
      "body",
      "armor",
      "belt",
      "wrists",
      "hands",
      "ring",
      "feet",
      "slotless",
    ])
    .optional(),
  activationType: z
    .enum([
      "continuous",
      "use-activated",
      "command-word",
      "spell-trigger",
      "spell-completion",
    ])
    .optional(),
});

export const pf2eMetaSchema = z.object({
  itemLevel: z.number().int().min(1).max(25),
  traits: z.array(z.string()).optional(),
  bulk: z.union([z.literal("L"), z.number().int().min(1).max(10)]).optional(),
  potencyRune: z
    .union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
    .optional(),
  strikingRune: z
    .enum(["striking", "greater striking", "major striking"])
    .nullable()
    .optional(),
  resilientRune: z
    .enum(["resilient", "greater resilient", "major resilient"])
    .nullable()
    .optional(),
  propertyRunes: z.array(z.string()).max(3).optional(),
  invested: z.boolean().optional(),
});

// ── Helper de parse seguro ────────────────────────────────────────────────────
// Use sempre este helper — nunca JSON.parse direto em systemMeta.
export function parseSystemMeta(
  system: RPGSystem,
  raw: string | null,
): SystemMeta {
  if (!raw) return null;
  try {
    const json = JSON.parse(raw);
    switch (system) {
      case "dnd5e":
        return dnd5eMetaSchema.parse(json);
      case "pf1":
        return pf1eMetaSchema.parse(json);
      case "pf2":
        return pf2eMetaSchema.parse(json);
      default:
        return null;
    }
  } catch {
    return null;
  }
}
