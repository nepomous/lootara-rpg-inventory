import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  Sword,
  Shield,
  Package,
  FlaskConical,
  Wrench,
  Sparkles,
  Crosshair,
  Archive,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { ITEM_CATEGORIES, ITEM_RARITIES } from "@/constants/rpg";
import type { ItemCategory, ItemRarity, RPGSystem } from "@/constants/rpg";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import type { CustomItem } from "@/db/schema";
import { useCustomItems } from "@/hooks/useCustomItems";
import { parseSystemMeta } from "@/types/systemMeta";
import type { DnD5eMeta, PF1eMeta, PF2eMeta } from "@/types/systemMeta";

const CATEGORY_ICONS: Record<ItemCategory, LucideIcon> = {
  weapon: Sword,
  armor: Shield,
  gear: Package,
  potion: FlaskConical,
  tool: Wrench,
  magic: Sparkles,
  ammunition: Crosshair,
  container: Archive,
};

// ── Zod schema (campos universais + todos os sistemas) ────────────────────────
const formSchema = z.object({
  name: z.string().min(2).max(60),
  category: z.enum([
    "weapon",
    "armor",
    "gear",
    "potion",
    "tool",
    "magic",
    "ammunition",
    "container",
  ] as const),
  weight: z.number().min(0),
  cost: z.number().min(0),
  rarity: z.enum([
    "common",
    "uncommon",
    "rare",
    "very_rare",
    "legendary",
  ] as const),
  description: z.string().max(300),
  magicBonus: z.number().int().min(0).max(5),
  // D&D 5e
  attunement: z.boolean(),
  attunementPrereq: z.string().max(100),
  charges: z.number().int().min(0).max(99).nullable(),
  recharge: z.string().max(80),
  cursed: z.boolean(),
  // PF1e
  casterLevel: z.number().int().min(1).max(30).nullable(),
  auraStrength: z
    .enum(["faint", "moderate", "strong", "overwhelming"])
    .nullable(),
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
    .nullable(),
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
    .nullable(),
  activationType: z
    .enum([
      "continuous",
      "use-activated",
      "command-word",
      "spell-trigger",
      "spell-completion",
    ])
    .nullable(),
  // PF2e
  itemLevel: z.number().int().min(1).max(25).nullable(),
  bulk: z.union([z.literal("L"), z.number().int().min(1).max(10)]).nullable(),
  potencyRune: z
    .union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
    .nullable(),
  strikingRune: z
    .enum(["striking", "greater striking", "major striking"])
    .nullable(),
  resilientRune: z
    .enum(["resilient", "greater resilient", "major resilient"])
    .nullable(),
  propertyRunes: z.array(z.string()),
  invested: z.boolean(),
  traits: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDefaultValues(system: RPGSystem, item?: CustomItem): FormValues {
  const meta = item ? parseSystemMeta(system, item.systemMeta ?? null) : null;
  const dnd5e = system === "dnd5e" ? (meta as DnD5eMeta | null) : null;
  const pf1e = system === "pf1" ? (meta as PF1eMeta | null) : null;
  const pf2e = system === "pf2" ? (meta as PF2eMeta | null) : null;
  return {
    name: item?.name ?? "",
    category: (item?.category ?? "gear") as FormValues["category"],
    weight: item?.weight ?? 0,
    cost: item?.cost ?? 0,
    rarity: (item?.rarity ?? "common") as FormValues["rarity"],
    description: item?.description ?? "",
    magicBonus: item?.magicBonus ?? 0,
    attunement: dnd5e?.attunement ?? false,
    attunementPrereq: dnd5e?.attunementPrereq ?? "",
    charges: dnd5e?.charges ?? null,
    recharge: dnd5e?.recharge ?? "",
    cursed: dnd5e?.cursed ?? false,
    casterLevel: pf1e?.casterLevel ?? null,
    auraStrength: pf1e?.auraStrength ?? null,
    auraSchool: pf1e?.auraSchool ?? null,
    slot: pf1e?.slot ?? null,
    activationType: pf1e?.activationType ?? null,
    itemLevel: pf2e?.itemLevel ?? (system === "pf2" ? 1 : null),
    bulk: pf2e?.bulk ?? null,
    potencyRune: pf2e?.potencyRune ?? null,
    strikingRune: pf2e?.strikingRune ?? null,
    resilientRune: pf2e?.resilientRune ?? null,
    propertyRunes: pf2e?.propertyRunes ?? [],
    invested: pf2e?.invested ?? false,
    traits: pf2e?.traits ?? [],
  };
}

function buildSystemMeta(system: RPGSystem, v: FormValues): string | null {
  if (system === "dnd5e") {
    const meta: DnD5eMeta = { attunement: v.attunement };
    if (v.attunementPrereq) meta.attunementPrereq = v.attunementPrereq;
    if (v.charges !== null && v.charges !== undefined) meta.charges = v.charges;
    if (v.recharge) meta.recharge = v.recharge;
    if (v.cursed) meta.cursed = v.cursed;
    return JSON.stringify(meta);
  }
  if (system === "pf1") {
    const meta: PF1eMeta = {};
    if (v.casterLevel !== null) meta.casterLevel = v.casterLevel ?? undefined;
    if (v.auraStrength) meta.auraStrength = v.auraStrength;
    if (v.auraSchool) meta.auraSchool = v.auraSchool;
    if (v.slot) meta.slot = v.slot;
    if (v.activationType) meta.activationType = v.activationType;
    return Object.keys(meta).length ? JSON.stringify(meta) : null;
  }
  if (system === "pf2") {
    const meta: PF2eMeta = { itemLevel: v.itemLevel ?? 1 };
    if (v.traits?.length) meta.traits = v.traits;
    if (v.bulk !== null) meta.bulk = v.bulk ?? undefined;
    if (v.potencyRune !== null) meta.potencyRune = v.potencyRune ?? undefined;
    if (v.strikingRune) meta.strikingRune = v.strikingRune;
    if (v.resilientRune) meta.resilientRune = v.resilientRune;
    if (v.propertyRunes?.length) meta.propertyRunes = v.propertyRunes;
    if (v.invested) meta.invested = v.invested;
    return JSON.stringify(meta);
  }
  return null;
}

// ── Sub-componente: Bônus Mágico (+0 a +5) ───────────────────────────────────

function MagicBonusField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.rowWrap}>
      {([0, 1, 2, 3, 4, 5] as const).map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[
              styles.chip,
              active && (opt > 0 ? styles.chipGold : styles.chipActive),
              { minWidth: 42, justifyContent: "center" },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                active &&
                  (opt > 0 ? styles.chipTextGold : styles.chipTextActive),
              ]}
            >
              {opt === 0 ? t("item_meta.magic_bonus_none", "+0") : `+${opt}`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Sub-componente: Campos D&D 5e ─────────────────────────────────────────────

function Dnd5eFields({ control }: { control: Control<FormValues> }) {
  const { t } = useTranslation();
  const attunement = useWatch({ control, name: "attunement" });
  return (
    <>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>{t("item_meta.attunement")}</Text>
        <Controller
          control={control}
          name="attunement"
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ true: Colors.gold, false: Colors.borderSubtle }}
              thumbColor={Colors.parchment}
              ios_backgroundColor={Colors.surfaceElevated}
            />
          )}
        />
      </View>
      {attunement && (
        <>
          <Text style={styles.label}>{t("item_meta.attunement_prereq")}</Text>
          <Controller
            control={control}
            name="attunementPrereq"
            render={({ field: { onChange, value } }) => (
              <BottomSheetTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Ex: apenas conjuradores"
                placeholderTextColor={Colors.mutedForeground}
                style={styles.input}
              />
            )}
          />
        </>
      )}
      <Text style={styles.label}>{t("item_meta.charges")}</Text>
      <Controller
        control={control}
        name="charges"
        render={({ field: { onChange, value } }) => (
          <BottomSheetTextInput
            value={value !== null && value !== undefined ? String(value) : ""}
            onChangeText={(v) =>
              onChange(v === "" ? null : parseInt(v, 10) || 0)
            }
            keyboardType="number-pad"
            placeholder="—"
            placeholderTextColor={Colors.mutedForeground}
            style={styles.input}
          />
        )}
      />
      <Text style={styles.label}>{t("item_meta.recharge")}</Text>
      <Controller
        control={control}
        name="recharge"
        render={({ field: { onChange, value } }) => (
          <BottomSheetTextInput
            value={value}
            onChangeText={onChange}
            placeholder="Ex: 1d6+1 ao amanhecer"
            placeholderTextColor={Colors.mutedForeground}
            style={styles.input}
          />
        )}
      />
      <View style={styles.rowBetween}>
        <Text style={styles.label}>{t("item_meta.cursed")}</Text>
        <Controller
          control={control}
          name="cursed"
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ true: Colors.crimson, false: Colors.borderSubtle }}
              thumbColor={Colors.parchment}
              ios_backgroundColor={Colors.surfaceElevated}
            />
          )}
        />
      </View>
    </>
  );
}

// ── Sub-componente: Campos PF1e ───────────────────────────────────────────────

const PF1E_AURA_STRENGTHS = [
  "faint",
  "moderate",
  "strong",
  "overwhelming",
] as const;
const PF1E_AURA_SCHOOLS = [
  "abjuration",
  "conjuration",
  "divination",
  "enchantment",
  "evocation",
  "illusion",
  "necromancy",
  "transmutation",
  "universal",
] as const;
const PF1E_SLOTS = [
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
] as const;
const PF1E_ACTIVATIONS = [
  "continuous",
  "use-activated",
  "command-word",
  "spell-trigger",
  "spell-completion",
] as const;

function Pf1eFields({ control }: { control: Control<FormValues> }) {
  const { t } = useTranslation();
  return (
    <>
      <Text style={styles.label}>{t("item_meta.caster_level")}</Text>
      <Controller
        control={control}
        name="casterLevel"
        render={({ field: { onChange, value } }) => (
          <BottomSheetTextInput
            value={value !== null && value !== undefined ? String(value) : ""}
            onChangeText={(v) =>
              onChange(v === "" ? null : parseInt(v, 10) || null)
            }
            keyboardType="number-pad"
            placeholder="1–30"
            placeholderTextColor={Colors.mutedForeground}
            style={styles.input}
          />
        )}
      />
      <Text style={styles.label}>{t("item_meta.aura_strength")}</Text>
      <Controller
        control={control}
        name="auraStrength"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {PF1E_AURA_STRENGTHS.map((opt) => {
              const active = value === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(active ? null : opt)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {t(`aura_strength.${opt}`, opt)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <Text style={styles.label}>{t("item_meta.aura_school")}</Text>
      <Controller
        control={control}
        name="auraSchool"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {PF1E_AURA_SCHOOLS.map((opt) => {
              const active = value === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(active ? null : opt)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {t(`aura_school.${opt}`, opt)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <Text style={styles.label}>{t("item_meta.slot")}</Text>
      <Controller
        control={control}
        name="slot"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {PF1E_SLOTS.map((opt) => {
              const active = value === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(active ? null : opt)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {t(`slot.${opt}`, opt)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <Text style={styles.label}>{t("item_meta.activation_type")}</Text>
      <Controller
        control={control}
        name="activationType"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {PF1E_ACTIVATIONS.map((opt) => {
              const active = value === opt;
              const key = opt.replaceAll("-", "_") as string;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(active ? null : opt)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {t(`activation.${key}`, opt)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
    </>
  );
}

// ── Sub-componente: Campos PF2e ───────────────────────────────────────────────

const PF2E_PROPERTY_RUNES = [
  "Flaming",
  "Frost",
  "Shock",
  "Corrosive",
  "Ghost Touch",
  "Keen",
  "Speed",
  "Vorpal",
  "Energy-Resistant",
  "Fortification",
  "Shadow",
  "Slick",
] as const;
const PF2E_BULK_OPTIONS = ["L", 1, 2, 3, 4, 5] as const;
const PF2E_STRIKING = [
  "striking",
  "greater striking",
  "major striking",
] as const;
const PF2E_RESILIENT = [
  "resilient",
  "greater resilient",
  "major resilient",
] as const;

function Pf2eFields({ control }: { control: Control<FormValues> }) {
  const { t } = useTranslation();
  const [traitInput, setTraitInput] = useState("");
  return (
    <>
      <Text style={styles.label}>{t("item_meta.item_level")} *</Text>
      <Controller
        control={control}
        name="itemLevel"
        render={({ field: { onChange, value } }) => (
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => onChange(Math.max(1, (value ?? 1) - 1))}
              style={styles.stepBtn}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepValue}>{value ?? 1}</Text>
            <Pressable
              onPress={() => onChange(Math.min(25, (value ?? 1) + 1))}
              style={styles.stepBtn}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        )}
      />
      <Text style={styles.label}>{t("item_meta.bulk")}</Text>
      <Controller
        control={control}
        name="bulk"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {PF2E_BULK_OPTIONS.map((opt) => {
              const active = value === opt;
              return (
                <Pressable
                  key={String(opt)}
                  onPress={() => onChange(active ? null : opt)}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                    { minWidth: 40, justifyContent: "center" },
                  ]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <Text style={styles.label}>{t("item_meta.potency_rune")}</Text>
      <Controller
        control={control}
        name="potencyRune"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {([0, 1, 2, 3] as const).map((opt) => {
              const active = value === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(active && opt !== 0 ? null : opt)}
                  style={[
                    styles.chip,
                    active && (opt > 0 ? styles.chipGold : styles.chipActive),
                    { minWidth: 42, justifyContent: "center" },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active &&
                        (opt > 0 ? styles.chipTextGold : styles.chipTextActive),
                    ]}
                  >
                    {opt === 0
                      ? t("item_meta.magic_bonus_none", "+0")
                      : `+${opt}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <Text style={styles.label}>{t("item_meta.striking_rune")}</Text>
      <Controller
        control={control}
        name="strikingRune"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {PF2E_STRIKING.map((opt) => {
              const active = value === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(active ? null : opt)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <Text style={styles.label}>{t("item_meta.resilient_rune")}</Text>
      <Controller
        control={control}
        name="resilientRune"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {PF2E_RESILIENT.map((opt) => {
              const active = value === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(active ? null : opt)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {opt}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <Text style={styles.label}>{t("item_meta.property_runes")}</Text>
      <Controller
        control={control}
        name="propertyRunes"
        render={({ field: { onChange, value } }) => (
          <View style={styles.rowWrap}>
            {PF2E_PROPERTY_RUNES.map((rune) => {
              const active = value.includes(rune);
              const atMax = value.length >= 3;
              return (
                <Pressable
                  key={rune}
                  onPress={() => {
                    if (active) onChange(value.filter((r) => r !== rune));
                    else if (!atMax) onChange([...value, rune]);
                  }}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                    !active && atMax && { opacity: 0.4 },
                  ]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {rune}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
      <View style={styles.rowBetween}>
        <Text style={styles.label}>{t("item_meta.invested")}</Text>
        <Controller
          control={control}
          name="invested"
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ true: Colors.gold, false: Colors.borderSubtle }}
              thumbColor={Colors.parchment}
              ios_backgroundColor={Colors.surfaceElevated}
            />
          )}
        />
      </View>
      <Text style={styles.label}>{t("item_meta.traits")}</Text>
      <Controller
        control={control}
        name="traits"
        render={({ field: { onChange, value } }) => (
          <>
            <View style={styles.rowWrap}>
              {value.map((trait, i) => (
                <Pressable
                  key={i}
                  onPress={() => onChange(value.filter((_, idx) => idx !== i))}
                  style={[styles.chip, styles.chipActive]}
                >
                  <Text style={styles.chipTextActive}>{trait} ×</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.traitInputRow}>
              <TextInput
                value={traitInput}
                onChangeText={setTraitInput}
                placeholder="Ex: magical, invested..."
                placeholderTextColor={Colors.mutedForeground}
                style={[styles.input, { flex: 1 }]}
                onSubmitEditing={() => {
                  const v = traitInput.trim();
                  if (v && !value.includes(v)) {
                    onChange([...value, v]);
                    setTraitInput("");
                  }
                }}
                returnKeyType="done"
              />
            </View>
          </>
        )}
      />
    </>
  );
}

// ── Tipos e interface pública ─────────────────────────────────────────────────

export type CustomItemFormRef = { present: () => void; dismiss: () => void };

type Props = {
  item?: CustomItem;
  system?: RPGSystem;
  onSave: (item: CustomItem) => void;
  onDelete?: (id: string) => void;
};

// ── Componente principal ──────────────────────────────────────────────────────

export const CustomItemForm = forwardRef<CustomItemFormRef, Props>(
  ({ item, system = "other", onSave, onDelete }, ref) => {
    const { t } = useTranslation();
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["92%"], []);
    const isEdit = !!item;

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const { createItemAsync, updateItemAsync, deleteItem } = useCustomItems();

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: getDefaultValues(system, item),
    });

    useEffect(() => {
      reset(getDefaultValues(system, item));
    }, [item, system]);

    const onSubmit = handleSubmit(async (values: FormValues) => {
      try {
        const systemMeta = buildSystemMeta(system, values);
        const payload = {
          name: values.name,
          category: values.category,
          weight: values.weight,
          cost: values.cost,
          rarity: values.rarity,
          description: values.description,
          magicBonus: values.magicBonus,
          systemMeta,
        };
        if (isEdit && item) {
          const updated = await updateItemAsync({ id: item.id, data: payload });
          onSave(updated);
        } else {
          const created = await createItemAsync(payload);
          onSave(created);
          reset(getDefaultValues(system));
        }
        sheetRef.current?.dismiss();
      } catch {
        /* Erros tratados no hook */
      }
    });

    function handleDelete() {
      if (!item || !onDelete) return;
      Alert.alert(
        t("custom_items.delete_confirm_title"),
        t("custom_items.delete_confirm_message"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("custom_items.delete_button"),
            style: "destructive",
            onPress: () => {
              deleteItem(item.id);
              onDelete(item.id);
              sheetRef.current?.dismiss();
            },
          },
        ],
      );
    }

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: Colors.surface }}
        handleIndicatorStyle={{ backgroundColor: Colors.borderDefault }}
        enablePanDownToClose
        onChange={(i) => {
          if (i === -1) reset(getDefaultValues(system));
        }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>
            {t(
              isEdit
                ? "custom_items.form_title_edit"
                : "custom_items.form_title_create",
            )}
          </Text>

          {/* ── Nome ── */}
          <Text style={styles.label}>{t("custom_items.field_name")}</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <BottomSheetTextInput
                value={value ?? ""}
                onChangeText={onChange}
                style={styles.input}
                placeholderTextColor={Colors.mutedForeground}
              />
            )}
          />
          {errors.name && (
            <Text style={styles.error}>{errors.name.message}</Text>
          )}

          {/* ── Categoria ── */}
          <Text style={styles.label}>{t("custom_items.field_category")}</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipGrid}>
                {(
                  Object.entries(ITEM_CATEGORIES) as [
                    ItemCategory,
                    { label: string; emoji: string },
                  ][]
                ).map(([key]) => {
                  const Icon = CATEGORY_ICONS[key];
                  const active = value === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onChange(key)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Icon
                        size={13}
                        color={active ? Colors.background : Colors.gold}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          active && styles.chipTextActive,
                        ]}
                      >
                        {t(`categories.${key}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />

          {/* ── Peso + Custo ── */}
          <View style={{ flexDirection: "row", gap: Spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                {t("custom_items.field_weight")} (lbs)
              </Text>
              <Controller
                control={control}
                name="weight"
                render={({ field: { onChange, value } }) => (
                  <BottomSheetTextInput
                    value={value !== undefined ? String(value) : "0"}
                    onChangeText={(v) => onChange(parseFloat(v) || 0)}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    placeholderTextColor={Colors.mutedForeground}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                {t("custom_items.field_cost")} ({t("library.cost_unit")})
              </Text>
              <Controller
                control={control}
                name="cost"
                render={({ field: { onChange, value } }) => (
                  <BottomSheetTextInput
                    value={value !== undefined ? String(value) : "0"}
                    onChangeText={(v) => onChange(parseFloat(v) || 0)}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    placeholderTextColor={Colors.mutedForeground}
                  />
                )}
              />
            </View>
          </View>

          {/* ── Bônus Mágico ── */}
          <Text style={styles.label}>{t("item_meta.magic_bonus")}</Text>
          <Controller
            control={control}
            name="magicBonus"
            render={({ field: { value, onChange } }) => (
              <MagicBonusField value={value} onChange={onChange} />
            )}
          />

          {/* ── Raridade (oculta para PF1e) ── */}
          {system !== "pf1" && (
            <>
              <Text style={styles.label}>
                {t("item_meta.rarity", t("custom_items.field_rarity"))}
              </Text>
              <Controller
                control={control}
                name="rarity"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.rarityRow}>
                    {(
                      Object.entries(ITEM_RARITIES) as [
                        ItemRarity,
                        { label: string; color: string },
                      ][]
                    ).map(([key, info]) => {
                      const active = value === key;
                      return (
                        <Pressable
                          key={key}
                          onPress={() => onChange(key)}
                          style={[
                            styles.chip,
                            { flex: 1 },
                            active && {
                              borderColor: info.color,
                              backgroundColor: `${info.color}22`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              active && { color: info.color },
                            ]}
                            numberOfLines={1}
                          >
                            {t(`library.rarity_${key}`)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              />
            </>
          )}

          {/* ── Descrição ── */}
          <Text style={styles.label}>
            {t("custom_items.field_description")}
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <BottomSheetTextInput
                value={value ?? ""}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                placeholder={t("custom_items.description_placeholder")}
                placeholderTextColor={Colors.mutedForeground}
                style={[styles.input, styles.textarea]}
              />
            )}
          />

          {/* ── Campos específicos por sistema ── */}
          {system === "dnd5e" && <Dnd5eFields control={control} />}
          {system === "pf1" && <Pf1eFields control={control} />}
          {system === "pf2" && <Pf2eFields control={control} />}
          {(system === "other" || system === "generic") && (
            <Text style={styles.systemNote}>
              {t("item_meta.system_fields_note")}
            </Text>
          )}

          {/* ── Submit ── */}
          <Pressable
            onPress={onSubmit}
            style={{
              borderRadius: Radius.md,
              overflow: "hidden",
              marginTop: Spacing.lg,
            }}
          >
            <LinearGradient
              colors={["#dcc080", "#b8953c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitBtn}
            >
              <Text style={styles.submitText}>
                {t(
                  isEdit
                    ? "custom_items.submit_edit"
                    : "custom_items.submit_create",
                )}
              </Text>
            </LinearGradient>
          </Pressable>

          {isEdit && onDelete && (
            <Pressable onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>
                {t("custom_items.delete_button")}
              </Text>
            </Pressable>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl * 2 },
  title: {
    ...Typography.display,
    color: Colors.gold,
    fontSize: 15,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  label: {
    ...Typography.bodySemiBold,
    color: Colors.mutedForeground,
    fontSize: 10,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.sm,
    color: Colors.parchment,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
  },
  textarea: { height: 72, textAlignVertical: "top", paddingTop: Spacing.sm },
  error: { color: Colors.crimson, fontSize: 11, marginTop: 2 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  rarityRow: { flexDirection: "row", gap: Spacing.xs },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceElevated,
  },
  chipActive: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(201,168,76,0.15)",
  },
  chipGold: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(201,168,76,0.25)",
  },
  chipText: { ...Typography.body, color: Colors.parchment, fontSize: 11 },
  chipTextActive: { ...Typography.body, color: Colors.gold, fontSize: 11 },
  chipTextGold: {
    ...Typography.body,
    color: Colors.gold,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
  },
  submitBtn: { paddingVertical: Spacing.lg, alignItems: "center" },
  submitText: { ...Typography.display, color: Colors.background, fontSize: 13 },
  deleteBtn: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  deleteText: {
    ...Typography.bodySemiBold,
    color: Colors.crimson,
    fontSize: 14,
  },
  systemNote: {
    ...Typography.body,
    color: Colors.mutedForeground,
    fontSize: 12,
    marginTop: Spacing.lg,
    textAlign: "center",
    fontStyle: "italic",
  },
  traitInputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: Spacing.lg },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { ...Typography.bodyBold, color: Colors.gold, fontSize: 20 },
  stepValue: {
    ...Typography.bodyBold,
    color: Colors.parchment,
    fontSize: 22,
    minWidth: 40,
    textAlign: "center",
  },
});
