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
  CHARACTER_RACES,
  CharacterClass,
  CharacterRace,
  MAX_LEVEL,
  MIN_LEVEL,
  RPG_SYSTEMS,
} from "@/constants/rpg";
import type { RPGSystem } from "@/db/schema";
import { useCreateCharacter } from "@/hooks/useCharacters";

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

const CLASS_ENTRIES = Object.entries(CHARACTER_CLASSES) as [
  CharacterClass,
  { label: string; emoji: string },
][];

const RACE_ENTRIES = Object.entries(CHARACTER_RACES) as [
  CharacterRace,
  { label: string; emoji: string },
][];

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
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row flex-wrap gap-2">
      {CLASS_ENTRIES.map(([key, info]) => {
        const selected = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            className={`w-16 items-center py-2 rounded-xl border ${
              selected
                ? "bg-primary border-primary"
                : "bg-background-surface border-border"
            }`}
          >
            <Text className="text-2xl">{info.emoji}</Text>
            <Text
              className={`text-xs mt-0.5 text-center leading-3 ${
                selected ? "text-text-inverse font-bold" : "text-text-muted"
              }`}
              numberOfLines={2}
            >
              {t(`classes.${key}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RaceDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row"
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {RACE_ENTRIES.map(([key, info]) => {
        const selected = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-chip border ${
              selected
                ? "bg-primary border-primary"
                : "bg-background-surface border-border"
            }`}
          >
            <Text>{info.emoji}</Text>
            <Text
              className={`text-sm ${
                selected ? "text-text-inverse font-bold" : "text-text-muted"
              }`}
            >
              {t(`races.${key}`)}
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

  const {
    control,
    handleSubmit,
    watch,
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

  const selectedClass = watch("class");

  function onSubmit(values: FormValues) {
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
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 28 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: t("new_character.title") }} />
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
            <ClassGrid value={value} onChange={onChange} />
          )}
        />
      </View>

      {/* Raça */}
      <View>
        <FieldLabel
          label={t("new_character.race_label")}
          error={errors.race?.message}
        />
        <Controller
          control={control}
          name="race"
          render={({ field: { onChange, value } }) => (
            <RaceDropdown value={value} onChange={onChange} />
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

      {/* Sistema */}
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
              {t(`classes.${selectedClass as CharacterClass}`)}
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
  );
}
