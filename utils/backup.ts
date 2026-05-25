import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { z } from "zod";
import {
  getCharacters,
  getAllBagItems,
  getCustomItems,
  upsertCharacter,
  upsertBagItem,
  upsertCustomItem,
} from "@/db/index";

const BACKUP_VERSION = 2;

// ── Schemas de validação defensiva do arquivo de backup ───────────────────────
// SEC-04: Cada campo tem tipo exato, limites de tamanho e formato validado.
// Isso impede que um arquivo JSON malicioso injete dados fora do esperado.

const CharacterImportSchema = z.object({
  // SEC-04: UUID v4 obrigatório — impede IDs arbitrários via import malicioso
  id: z.string().uuid(),
  name: z.string().min(1).max(60),
  class: z.string().min(1).max(50),
  race: z.string().min(1).max(50),
  level: z.number().int().min(1).max(20),
  system: z.enum(["dnd5e", "pf1", "pf2", "other"]),
  avatarEmoji: z.string().max(10).nullable().default(null),
  // SEC-04: timestamps positivos evitam datas negativas ou overflow
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

const BagItemImportSchema = z.object({
  id: z.string().uuid(),
  characterId: z.string().uuid(),
  // SEC-04: itemId referencia itens da biblioteca — limite razoável de 100 chars
  itemId: z.string().max(100).nullable().default(null),
  customName: z.string().max(60).nullable().default(null),
  isCustom: z.number().int().min(0).max(1).default(0),
  quantity: z.number().int().min(1).max(9999),
  location: z.enum(["equipped", "backpack", "stored"]),
  notes: z.string().max(500).nullable().default(null),
  description: z.string().max(1000).nullable().default(null),
  rarity: z
    .enum(["common", "uncommon", "rare", "very_rare", "legendary"])
    .nullable()
    .default(null),
  magicBonus: z.number().int().min(0).max(5).default(0),
  // SEC-04: systemMeta é JSON serializado — limite de 2000 chars
  systemMeta: z.string().max(2000).nullable().default(null),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

const CustomItemImportSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(60),
  category: z.enum([
    "weapon",
    "armor",
    "gear",
    "potion",
    "tool",
    "magic",
    "ammunition",
    "container",
  ]),
  weight: z.number().min(0).max(9999),
  cost: z.number().min(0).max(9_999_999),
  rarity: z.enum(["common", "uncommon", "rare", "very_rare", "legendary"]),
  description: z.string().max(1000).nullable().default(null),
  magicBonus: z.number().int().min(0).max(5).default(0),
  systemMeta: z.string().max(2000).nullable().default(null),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

const BackupSchema = z.object({
  // SEC-04: version literal(2) rejeita backups de versões incompatíveis
  version: z.literal(2),
  exportedAt: z.number().int().positive(),
  // SEC-04: limites de array evitam DoS por imports gigantes
  characters: z.array(CharacterImportSchema).max(500),
  bagItems: z.array(BagItemImportSchema).max(10_000),
  customItems: z.array(CustomItemImportSchema).max(1_000).optional(),
});

// ── Export ────────────────────────────────────────────────────────────────────
// Serializa characters + bag_items em JSON e abre o diálogo de compartilhamento.
export async function exportData(): Promise<void> {
  const characters = getCharacters();
  const bagItems = getAllBagItems();
  const customItems = getCustomItems();

  const backup = {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    characters,
    bagItems,
    customItems,
  };

  const json = JSON.stringify(backup, null, 2);
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `lootara_backup_${date}.json`;
  const fileUri = `${FileSystem.cacheDirectory ?? ""}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Compartilhamento não disponível neste dispositivo.");
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: "application/json",
    dialogTitle: "Exportar backup Lootara",
    UTI: "public.json",
  });
}

// ── Import ────────────────────────────────────────────────────────────────────
// Abre seletor de arquivo, valida com Zod e faz upsert no banco.
// Retorna um resumo da operação ou lança erro com mensagem legível.
export async function importData(): Promise<{
  characters: number;
  bagItems: number;
  customItems: number;
}> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "*/*"],
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    throw new Error("CANCELLED");
  }

  const file = result.assets[0];
  if (!file?.uri) {
    throw new Error("Arquivo inválido.");
  }

  let raw: string;
  try {
    raw = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch {
    throw new Error("Não foi possível ler o arquivo.");
  }

  // SEC-04: Limite de 5 MB — rejeita arquivos gigantes antes de parsear
  // Previne DoS via JSON.parse de strings arbitrariamente grandes
  if (raw.length > 5_000_000) {
    throw new Error("Arquivo muito grande. O backup deve ter menos de 5 MB.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }

  const validation = BackupSchema.safeParse(parsed);
  if (!validation.success) {
    throw new Error(
      "Formato de backup inválido. Certifique-se de usar um arquivo exportado pelo Lootara.",
    );
  }

  const data = validation.data;

  // Upsert: inserir ou atualizar registros existentes
  for (const char of data.characters) {
    upsertCharacter(char);
  }
  for (const item of data.bagItems) {
    upsertBagItem(item);
  }
  for (const ci of data.customItems ?? []) {
    upsertCustomItem(ci);
  }

  return {
    characters: data.characters.length,
    bagItems: data.bagItems.length,
    customItems: (data.customItems ?? []).length,
  };
}
