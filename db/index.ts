import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import type { NewCharacter, NewBagItem, Character, BagItem } from "./schema";

// Instância singleton do banco SQLite
const sqlite = openDatabaseSync("lootara.db", { enableChangeListener: true });

// Instância do Drizzle ORM tipada com o schema
export const db = drizzle(sqlite, { schema });

// ── Migration runner ─────────────────────────────────────────────────────────
// Cria as tabelas se não existirem (abordagem pragmática para o MVP).
// Quando houver migrations geradas pelo Drizzle Kit, substituir por:
//   import { migrate } from "drizzle-orm/expo-sqlite/migrator";
//   import migrations from "./migrations/migrations";
//   await migrate(db, migrations);
export async function runMigrations(): Promise<void> {
  await sqlite.execAsync(`
    CREATE TABLE IF NOT EXISTS characters (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      class TEXT NOT NULL,
      race TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      system TEXT NOT NULL,
      avatar_emoji TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bag_items (
      id TEXT PRIMARY KEY NOT NULL,
      character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      item_id TEXT,
      custom_name TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      location TEXT NOT NULL DEFAULT 'backpack',
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bag_items_character_id
      ON bag_items (character_id);
  `);
}

// ── Helpers internos ─────────────────────────────────────────────────────────
function now(): number {
  return Date.now();
}

// ── Characters ───────────────────────────────────────────────────────────────

export function getCharacters(): Character[] {
  return db
    .select()
    .from(schema.characters)
    .orderBy(schema.characters.createdAt)
    .all();
}

export function getCharacterById(id: string): Character | undefined {
  return db
    .select()
    .from(schema.characters)
    .where(eq(schema.characters.id, id))
    .get();
}

export function createCharacter(
  data: Omit<NewCharacter, "createdAt" | "updatedAt">,
): Character {
  const timestamp = now();
  const row: NewCharacter = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.insert(schema.characters).values(row).run();
  const created = getCharacterById(data.id ?? "");
  if (!created) throw new Error("Falha ao criar personagem");
  return created;
}

export function updateCharacter(
  id: string,
  data: Partial<Omit<NewCharacter, "id" | "createdAt" | "updatedAt">>,
): Character {
  db.update(schema.characters)
    .set({ ...data, updatedAt: now() })
    .where(eq(schema.characters.id, id))
    .run();
  const updated = getCharacterById(id);
  if (!updated) throw new Error("Personagem não encontrado");
  return updated;
}

export function deleteCharacter(id: string): void {
  // bag_items são removidos automaticamente via CASCADE
  db.delete(schema.characters).where(eq(schema.characters.id, id)).run();
}

// ── Bag Items ─────────────────────────────────────────────────────────────────

export function getBagItems(characterId: string): BagItem[] {
  return db
    .select()
    .from(schema.bagItems)
    .where(eq(schema.bagItems.characterId, characterId))
    .orderBy(schema.bagItems.createdAt)
    .all();
}

export function addBagItem(
  data: Omit<NewBagItem, "createdAt" | "updatedAt">,
): BagItem {
  const timestamp = now();
  const row: NewBagItem = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.insert(schema.bagItems).values(row).run();
  const created = db
    .select()
    .from(schema.bagItems)
    .where(eq(schema.bagItems.id, data.id ?? ""))
    .get();
  if (!created) throw new Error("Falha ao adicionar item à sacola");
  return created;
}

export function updateBagItem(
  id: string,
  data: Partial<
    Omit<NewBagItem, "id" | "characterId" | "createdAt" | "updatedAt">
  >,
): BagItem {
  db.update(schema.bagItems)
    .set({ ...data, updatedAt: now() })
    .where(eq(schema.bagItems.id, id))
    .run();
  const updated = db
    .select()
    .from(schema.bagItems)
    .where(eq(schema.bagItems.id, id))
    .get();
  if (!updated) throw new Error("Item não encontrado na sacola");
  return updated;
}

export function removeBagItem(id: string): void {
  db.delete(schema.bagItems).where(eq(schema.bagItems.id, id)).run();
}

export function getAllBagItems(): BagItem[] {
  return db
    .select()
    .from(schema.bagItems)
    .orderBy(schema.bagItems.createdAt)
    .all();
}

export function upsertCharacter(data: Character): void {
  db.insert(schema.characters)
    .values(data)
    .onConflictDoUpdate({
      target: schema.characters.id,
      set: {
        name: data.name,
        class: data.class,
        race: data.race,
        level: data.level,
        system: data.system,
        avatarEmoji: data.avatarEmoji,
        updatedAt: data.updatedAt,
      },
    })
    .run();
}

export function upsertBagItem(data: BagItem): void {
  db.insert(schema.bagItems)
    .values(data)
    .onConflictDoUpdate({
      target: schema.bagItems.id,
      set: {
        characterId: data.characterId,
        itemId: data.itemId,
        customName: data.customName,
        quantity: data.quantity,
        location: data.location,
        notes: data.notes,
        updatedAt: data.updatedAt,
      },
    })
    .run();
}

export { schema };
