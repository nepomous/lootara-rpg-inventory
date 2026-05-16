import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { z } from "zod";
import {
  getCharacters,
  getAllBagItems,
  upsertCharacter,
  upsertBagItem,
} from "@/db/index";

const BACKUP_VERSION = 1;

// ── Schemas de validação do arquivo de backup ─────────────────────────────────
const CharacterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  class: z.string().min(1),
  race: z.string().min(1),
  level: z.number().int().min(1).max(20),
  system: z.enum(["dnd5e", "pf1", "pf2", "other"]),
  avatarEmoji: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const BagItemSchema = z.object({
  id: z.string().min(1),
  characterId: z.string().min(1),
  itemId: z.string().nullable(),
  customName: z.string().nullable(),
  quantity: z.number().int().min(1),
  location: z.enum(["equipped", "backpack", "stored"]),
  notes: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const BackupSchema = z.object({
  version: z.number(),
  exportedAt: z.number(),
  characters: z.array(CharacterSchema),
  bagItems: z.array(BagItemSchema),
});

type BackupData = z.infer<typeof BackupSchema>;

// ── Export ────────────────────────────────────────────────────────────────────
// Serializa characters + bag_items em JSON e abre o diálogo de compartilhamento.
export async function exportData(): Promise<void> {
  const characters = getCharacters();
  const bagItems = getAllBagItems();

  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    characters,
    bagItems,
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

  return { characters: data.characters.length, bagItems: data.bagItems.length };
}
