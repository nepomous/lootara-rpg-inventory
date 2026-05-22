import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import type {
  NewCharacter,
  NewBagItem,
  Character,
  BagItem,
  CustomItem,
  NewCustomItem,
} from "./schema";
import migrations from "./migrations/migrations";

// Instância singleton do banco SQLite
const sqlite = openDatabaseSync("lootara.db", { enableChangeListener: true });

// Instância do Drizzle ORM tipada com o schema
export const db = drizzle(sqlite, { schema });

// ── Migration runner ─────────────────────────────────────────────────────────
export async function runMigrations(): Promise<void> {
  // Safe upgrade for existing DBs that were created before Drizzle migrations:
  // add is_custom column to bag_items if not present yet.
  try {
    sqlite.execSync(
      "ALTER TABLE bag_items ADD COLUMN is_custom INTEGER NOT NULL DEFAULT 0",
    );
  } catch {
    // Column already exists or table doesn't exist yet — both are fine.
  }
  // Safe upgrade: add system-metadata columns to bag_items (migration 0002)
  const bagItemCols = [
    "ALTER TABLE bag_items ADD COLUMN description TEXT",
    "ALTER TABLE bag_items ADD COLUMN rarity TEXT",
    "ALTER TABLE bag_items ADD COLUMN magic_bonus INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE bag_items ADD COLUMN system_meta TEXT",
  ];
  for (const sql of bagItemCols) {
    try {
      sqlite.execSync(sql);
    } catch {
      // Column already exists — safe to ignore.
    }
  }
  await migrate(db, migrations);
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
        isCustom: data.isCustom,
        quantity: data.quantity,
        location: data.location,
        notes: data.notes,
        updatedAt: data.updatedAt,
      },
    })
    .run();
}

// ── Custom Items ──────────────────────────────────────────────────────────────

export function getCustomItems(): CustomItem[] {
  return db
    .select()
    .from(schema.customItems)
    .orderBy(schema.customItems.createdAt)
    .all();
}

export function getCustomItemById(id: string): CustomItem | undefined {
  return db
    .select()
    .from(schema.customItems)
    .where(eq(schema.customItems.id, id))
    .get();
}

export function createCustomItem(
  data: Omit<NewCustomItem, "createdAt" | "updatedAt">,
): CustomItem {
  const timestamp = now();
  const row: NewCustomItem = {
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.insert(schema.customItems).values(row).run();
  const created = getCustomItemById(data.id ?? "");
  if (!created) throw new Error("Falha ao criar item customizado");
  return created;
}

export function updateCustomItem(
  id: string,
  data: Partial<Omit<NewCustomItem, "id" | "createdAt" | "updatedAt">>,
): CustomItem {
  db.update(schema.customItems)
    .set({ ...data, updatedAt: now() })
    .where(eq(schema.customItems.id, id))
    .run();
  const updated = getCustomItemById(id);
  if (!updated) throw new Error("Item customizado não encontrado");
  return updated;
}

export function deleteCustomItem(id: string): void {
  // Remove bag_items referenciando este custom_item
  db.delete(schema.bagItems).where(eq(schema.bagItems.itemId, id)).run();
  db.delete(schema.customItems).where(eq(schema.customItems.id, id)).run();
}

export function upsertCustomItem(data: CustomItem): void {
  db.insert(schema.customItems)
    .values(data)
    .onConflictDoUpdate({
      target: schema.customItems.id,
      set: {
        name: data.name,
        category: data.category,
        weight: data.weight,
        cost: data.cost,
        description: data.description,
        rarity: data.rarity,
        magicBonus: data.magicBonus,
        systemMeta: data.systemMeta,
        updatedAt: data.updatedAt,
      },
    })
    .run();
}

export { schema };
