import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import type { ItemCategory, ItemRarity } from "../constants/rpg";

// ── Enums de domínio (espelham constants/rpg.ts para uso nas queries) ────────
export type RPGSystem = "dnd5e" | "pf1" | "pf2" | "other";
export type BagItemLocation = "equipped" | "backpack" | "stored";

// ── Personagens ──────────────────────────────────────────────────────────────
export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(), // UUID v4
  name: text("name").notNull(),
  class: text("class").notNull(),
  race: text("race").notNull(),
  level: integer("level").notNull().default(1), // 1–20
  system: text("system").$type<RPGSystem>().notNull(),
  avatarEmoji: text("avatar_emoji"), // ex: '⚔️'
  createdAt: integer("created_at").notNull(), // unix timestamp (ms)
  updatedAt: integer("updated_at").notNull(),
});

// ── Itens customizados do usuário ────────────────────────────────────────────
export const customItems = sqliteTable("custom_items", {
  id: text("id").primaryKey(), // UUID v4
  name: text("name").notNull(),
  category: text("category").$type<ItemCategory>().notNull(),
  weight: real("weight").notNull().default(0), // em libras
  cost: real("cost").notNull().default(0), // em peças de ouro
  description: text("description").default(""),
  rarity: text("rarity").$type<ItemRarity>().notNull().default("common"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// ── Itens da sacola ──────────────────────────────────────────────────────────
export const bagItems = sqliteTable("bag_items", {
  id: text("id").primaryKey(), // UUID v4
  characterId: text("character_id")
    .notNull()
    .references(() => characters.id, { onDelete: "cascade" }),
  itemId: text("item_id"), // null se item personalizado legado
  customName: text("custom_name"), // preenchido se itemId for null (legado)
  isCustom: integer("is_custom").notNull().default(0), // 0 = biblioteca estática, 1 = custom_item
  quantity: integer("quantity").notNull().default(1), // mínimo 1
  location: text("location")
    .$type<BagItemLocation>()
    .notNull()
    .default("backpack"),
  notes: text("notes"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// ── Types inferidos do schema (fonte de verdade) ─────────────────────────────
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type CustomItem = typeof customItems.$inferSelect;
export type NewCustomItem = typeof customItems.$inferInsert;
export type BagItem = typeof bagItems.$inferSelect;
export type NewBagItem = typeof bagItems.$inferInsert;
