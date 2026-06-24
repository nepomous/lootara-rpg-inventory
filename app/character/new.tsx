import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  CHARACTER_CLASSES,
  CharacterClass,
  FREE_CHARACTER_LIMIT,
  MAX_LEVEL,
  MIN_LEVEL,
  RPG_SYSTEMS,
  getClassesBySystem,
  getRacesBySystem,
} from "@/constants/rpg";
import type { RPGSystem } from "@/db/schema";
import { useCreateCharacter, useCharacters } from "@/hooks/useCharacters";
import { usePremiumStore } from "@/store/premiumStore";
import { ProUpsellSheet } from "@/components/ProUpsellSheet";

// ── Schema Zod ────────────────────────────────────────────────────────────────
const createCharacterSchema = z.object({
  name: z
    .string()
    .min(1, "errors.name_required")
    .max(50, "errors.name_max")
    .trim(),
  class: z.string().min(1, "errors.class_required"),
  race: z.string().min(1, "errors.race_required"),
  level: z.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
  system: z.enum(["dnd5e", "pf1", "pf2", "other"] as const),
});

type FormValues = z.infer<typeof createCharacterSchema>;

type ClassEntry = {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly group?: string;
};

// ── Subcomponentes ────────────────────────────────────────────────────────────

function FieldLabel({ label, error }: { label: string; error?: string }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-baseline gap-2 mb-2">
      <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest">
        {label}
      </Text>
      {error ? (
        <Text className="text-error text-xs">
          {t(error as Parameters<typeof t>[0])}
        </Text>
      ) : null}
    </View>
  );
}

function ClassGrid({
  value,
  onChange,
  entries,
}: {
  value: string;
  onChange: (v: string) => void;
  entries: readonly ClassEntry[];
}) {
  const { t } = useTranslation();
  const hasGroups = entries.some((e) => e.group != null);

  const renderItem = (item: ClassEntry) => {
    const selected = value === item.id;
    const rawLabel = t(`classes.${item.id}`, { defaultValue: item.label });
    const displayLabel = typeof rawLabel === "string" ? rawLabel : item.label;
    return (
      <Pressable
        key={`class-${String(item.id)}`}
        onPress={() => onChange(item.id)}
        className={`w-16 items-center py-2 rounded-xl border ${
          selected
            ? "bg-primary border-primary"
            : "bg-background-surface border-border"
        }`}
      >
        <Text className="text-2xl">{item.emoji}</Text>
        <Text
          className={`text-xs mt-0.5 text-center leading-3 ${
            selected ? "text-text-inverse font-bold" : "text-text-muted"
          }`}
          numberOfLines={2}
        >
          {displayLabel}
        </Text>
      </Pressable>
    );
  };

  if (!hasGroups) {
    return (
      <View className="flex-row flex-wrap gap-2">
        {entries.map(renderItem)}
      </View>
    );
  }

  const groupOrder: string[] = [];
  const grouped: Record<string, ClassEntry[]> = {};
  for (const e of entries) {
    const g = e.group ?? "Outro";
    if (!groupOrder.includes(g)) groupOrder.push(g);
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(e);
  }
  return (
    <View style={{ gap: 12 }}>
      {groupOrder.map((group) => (
        <View key={group}>
          <Text className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
            {t(`class_groups.${group}`, { defaultValue: group })}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {grouped[group].map(renderItem)}
          </View>
        </View>
      ))}
    </View>
  );
}

function RaceDropdown({
  value,
  onChange,
  races,
}: {
  value: string;
  onChange: (v: string) => void;
  races: readonly { id: string; label: string }[];
}) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row"
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {races.map((race) => {
        const selected = value === race.id;
        return (
          <Pressable
            key={race.id}
            onPress={() => onChange(race.id)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-chip border ${
              selected
                ? "bg-primary border-primary"
                : "bg-background-surface border-border"
            }`}
          >
            <Text
              className={`text-sm ${
                selected ? "text-text-inverse font-bold" : "text-text-muted"
              }`}
            >
              {t(`races.${race.id}`, { defaultValue: race.label })}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function LevelStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center gap-4">
      <Pressable
        onPress={() => onChange(Math.max(MIN_LEVEL, value - 1))}
        disabled={value <= MIN_LEVEL}
        className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border"
      >
        <Text
          className={`text-xl font-bold ${
            value <= MIN_LEVEL ? "text-border" : "text-text"
          }`}
        >
          −
        </Text>
      </Pressable>
      <View className="items-center min-w-12">
        <Text className="text-primary text-2xl font-bold">{value}</Text>
        <Text className="text-text-muted text-xs">
          {t("new_character.level_of", { max: MAX_LEVEL })}
        </Text>
      </View>
      <Pressable
        onPress={() => onChange(Math.min(MAX_LEVEL, value + 1))}
        disabled={value >= MAX_LEVEL}
        className="w-10 h-10 rounded-full bg-background-surface items-center justify-center border border-border"
      >
        <Text
          className={`text-xl font-bold ${
            value >= MAX_LEVEL ? "text-border" : "text-text"
          }`}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}

function SystemSegmented({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: RPGSystem) => void;
}) {
  const { t } = useTranslation();
  const RPG_SYSTEM_OPTIONS: { value: RPGSystem; label: string }[] = [
    { value: "dnd5e", label: "D&D 5e" },
    { value: "pf1", label: "PF 1e" },
    { value: "pf2", label: "PF 2e" },
    { value: "other", label: t("common.other") },
  ];
  return (
    <View className="flex-row bg-background-surface rounded-xl p-1 gap-1">
      {RPG_SYSTEM_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={`flex-1 py-2 rounded-lg items-center ${
              selected ? "bg-primary" : ""
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selected ? "text-text-inverse" : "text-text-muted"
              }`}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function NewCharacterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: createCharacter, isPending } = useCreateCharacter();
  const { data: existingCharacters } = useCharacters();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const [upsellVisible, setUpsellVisible] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      name: "",
      class: "",
      race: "",
      level: 1,
      system: "dnd5e",
    },
  });

  const selectedSystem = watch("system");
  const selectedClass = watch("class");
  const systemClasses = getClassesBySystem(
    selectedSystem,
  ) as readonly ClassEntry[];
  const systemRaces = getRacesBySystem(selectedSystem);

  useEffect(() => {
    setValue("class", "");
    setValue("race", "");
  }, [selectedSystem]);

  function onSubmit(values: FormValues) {
    // Defense in depth: block creation if free plan limit reached via deep-link
    const characterCount = existingCharacters?.length ?? 0;
    if (!isPremium && characterCount >= FREE_CHARACTER_LIMIT) {
      setUpsellVisible(true);
      return;
    }

    const classInfo =
      CHARACTER_CLASSES[values.class as CharacterClass] ??
      CHARACTER_CLASSES.other;

    createCharacter(
      {
        name: values.name,
        class: values.class,
        race: values.race,
        level: values.level,
        system: values.system,
        avatarEmoji: classInfo.emoji,
      },
      {
        onSuccess: () => router.back(),
      },
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen options={{ title: t("new_character.title") }} />

        {/* Sistema — PRIMEIRO para filtrar classes e raças */}
        <View>
          <FieldLabel label={t("new_character.system_label")} />
          <Controller
            control={control}
            name="system"
            render={({ field: { onChange, value } }) => (
              <SystemSegmented value={value} onChange={onChange} />
            )}
          />
        </View>

        {/* Nome */}
        <View>
          <FieldLabel
            label={t("new_character.name_label")}
            error={errors.name?.message}
          />
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t("new_character.name_placeholder")}
                placeholderTextColor="#9ca3af"
                maxLength={50}
                className={`bg-background-surface text-text px-4 py-3 rounded-xl border text-base ${
                  errors.name ? "border-error" : "border-border"
                }`}
              />
            )}
          />
        </View>

        {/* Classe */}
        <View>
          <FieldLabel
            label={t("new_character.class_label")}
            error={errors.class?.message}
          />
          <Controller
            control={control}
            name="class"
            render={({ field: { onChange, value } }) => (
              <ClassGrid
                value={value}
                onChange={onChange}
                entries={systemClasses}
              />
            )}
          />
        </View>

        {/* Raça / Ancestral */}
        <View>
          <FieldLabel
            label={
              selectedSystem === "pf2"
                ? t("new_character.race_label_ancestral")
                : t("new_character.race_label")
            }
            error={errors.race?.message}
          />
          <Controller
            control={control}
            name="race"
            render={({ field: { onChange, value } }) => (
              <RaceDropdown
                value={value}
                onChange={onChange}
                races={systemRaces}
              />
            )}
          />
        </View>

        {/* Nível */}
        <View>
          <FieldLabel label={t("new_character.level_label")} />
          <Controller
            control={control}
            name="level"
            render={({ field: { onChange, value } }) => (
              <LevelStepper value={value} onChange={onChange} />
            )}
          />
        </View>

        {/* Preview do personagem */}
        {selectedClass ? (
          <View className="bg-background-card border border-border rounded-card p-4 flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-background-surface items-center justify-center">
              <Text className="text-4xl">
                {CHARACTER_CLASSES[selectedClass as CharacterClass]?.emoji ??
                  "🎭"}
              </Text>
            </View>
            <View>
              <Text className="text-text-muted text-xs uppercase tracking-widest">
                {t("new_character.preview")}
              </Text>
              <Text className="text-text font-bold text-base">
                {watch("name") || t("new_character.no_name")}
              </Text>
              <Text className="text-text-muted text-sm">
                {t(`classes.${selectedClass}`, {
                  defaultValue:
                    systemClasses.find((e) => e.id === selectedClass)?.label ??
                    selectedClass,
                })}
                {" · "}
                {t(
                  `characters.system_${watch("system") as keyof typeof RPG_SYSTEMS}`,
                )}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Botão submit */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className="bg-secondary rounded-xl py-4 items-center mt-2"
        >
          {isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-base">
              {t("new_character.submit_button")}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <ProUpsellSheet
        visible={upsellVisible}
        onClose={() => setUpsellVisible(false)}
        reason="character_limit"
      />
    </>
  );
}
