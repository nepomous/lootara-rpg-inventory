import React, { forwardRef, useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import {
  Colors,
  Gradients,
  Radius,
  Spacing,
  Typography,
} from "@/constants/theme";

// ── Schema Zod ────────────────────────────────────────────────────────────────
const createCharacterSchema = z.object({
  name: z
    .string()
    .min(1, "Nome obrigatório")
    .max(50, "Máximo 50 caracteres")
    .trim(),
  class: z.string().min(1, "Selecione uma classe"),
  race: z.string().min(1, "Selecione uma raça"),
  level: z.number().int().min(MIN_LEVEL).max(MAX_LEVEL),
  system: z.enum(["dnd5e", "pf1", "pf2", "other"] as const),
});

export type CreateCharacterDTO = z.infer<typeof createCharacterSchema>;

type AddCharacterSheetProps = {
  onSubmit: (data: CreateCharacterDTO) => void;
};

const RPG_SYSTEM_OPTIONS: { value: RPGSystem; label: string }[] = [
  { value: "dnd5e", label: "D&D 5e" },
  { value: "pf1", label: "PF 1e" },
  { value: "pf2", label: "PF 2e" },
  { value: "other", label: "Outro" },
];

const CLASS_GRID: { key: CharacterClass; label: string; emoji: string }[] = [
  { key: "fighter", label: "Guerreiro", emoji: "⚔️" },
  { key: "wizard", label: "Mago", emoji: "🔮" },
  { key: "rogue", label: "Ladino", emoji: "🗡️" },
  { key: "paladin", label: "Paladino", emoji: "🛡️" },
  { key: "ranger", label: "Patrulheiro", emoji: "🏹" },
  { key: "druid", label: "Druida", emoji: "🌿" },
  { key: "bard", label: "Bardo", emoji: "🎵" },
  { key: "warlock", label: "Bruxo", emoji: "💀" },
];

const RACE_ENTRIES = Object.entries(CHARACTER_RACES) as [
  CharacterRace,
  { label: string; emoji: string },
][];

// ── Subcomponentes ────────────────────────────────────────────────────────────

function FieldLabel({ label, error }: { label: string; error?: string }) {
  return (
    <View className="flex-row items-baseline gap-2 mb-2">
      <Text style={styles.fieldLabel}>{label}</Text>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
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
  return (
    <View className="flex-row flex-wrap gap-2">
      {CLASS_GRID.map((item) => {
        const selected = value === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.classItem, selected && styles.classItemActive]}
          >
            <Text className="text-2xl">{item.emoji}</Text>
            <Text
              style={[
                styles.classItemLabel,
                selected && styles.classItemLabelActive,
              ]}
              numberOfLines={2}
            >
              {item.label}
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {RACE_ENTRIES.map(([key, info]) => {
        const selected = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.raceItem, selected && styles.raceItemActive]}
          >
            <Text>{info.emoji}</Text>
            <Text
              style={[
                styles.raceItemLabel,
                selected && styles.raceItemLabelActive,
              ]}
            >
              {info.label}
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
  return (
    <View className="flex-row items-center gap-4">
      <Pressable
        onPress={() => onChange(Math.max(MIN_LEVEL, value - 1))}
        disabled={value <= MIN_LEVEL}
        style={[styles.stepBtn, value <= MIN_LEVEL && styles.stepBtnDisabled]}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <View className="items-center min-w-12">
        <Text style={styles.levelValue}>{value}</Text>
        <Text style={styles.levelMax}>de {MAX_LEVEL}</Text>
      </View>
      <Pressable
        onPress={() => onChange(Math.min(MAX_LEVEL, value + 1))}
        disabled={value >= MAX_LEVEL}
        style={[styles.stepBtn, value >= MAX_LEVEL && styles.stepBtnDisabled]}
      >
        <Text style={styles.stepBtnText}>+</Text>
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
  return (
    <View style={styles.systemRow}>
      {RPG_SYSTEM_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.systemItem, selected && styles.systemItemActive]}
          >
            <Text
              style={[
                styles.systemItemLabel,
                selected && styles.systemItemLabelActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Componente principal (bottom sheet) ───────────────────────────────────────

const AddCharacterSheet = forwardRef<BottomSheet, AddCharacterSheetProps>(
  function AddCharacterSheet({ onSubmit }, ref) {
    const snapPoints = useMemo(() => ["80%", "95%"], []);

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
    } = useForm<CreateCharacterDTO>({
      resolver: zodResolver(createCharacterSchema),
      defaultValues: {
        name: "",
        class: "",
        race: "",
        level: 1,
        system: "dnd5e",
      },
    });

    const handleClose = useCallback(() => {
      reset();
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.close();
      }
    }, [ref, reset]);

    function onValid(values: CreateCharacterDTO) {
      onSubmit(values);
      handleClose();
    }

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <View style={styles.dividerTop} />
            <Text style={styles.headerTitle}>Novo Herói</Text>
            <Text style={styles.headerSubtitle}>Forje sua lenda</Text>
          </View>

          {/* Nome */}
          <View style={styles.section}>
            <FieldLabel
              label="Nome do personagem"
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
                  placeholder="Ex: Aldric Stoneforge"
                  placeholderTextColor={Colors.mutedForeground}
                  maxLength={50}
                  style={[
                    styles.textInput,
                    errors.name && styles.textInputError,
                  ]}
                />
              )}
            />
          </View>

          {/* Classe */}
          <View style={styles.section}>
            <FieldLabel label="Classe" error={errors.class?.message} />
            <Controller
              control={control}
              name="class"
              render={({ field: { onChange, value } }) => (
                <ClassGrid value={value} onChange={onChange} />
              )}
            />
          </View>

          {/* Raça */}
          <View style={styles.section}>
            <FieldLabel label="Raça" error={errors.race?.message} />
            <Controller
              control={control}
              name="race"
              render={({ field: { onChange, value } }) => (
                <RaceDropdown value={value} onChange={onChange} />
              )}
            />
          </View>

          {/* Nível */}
          <View style={styles.section}>
            <FieldLabel label="Nível" />
            <Controller
              control={control}
              name="level"
              render={({ field: { onChange, value } }) => (
                <LevelStepper value={value} onChange={onChange} />
              )}
            />
          </View>

          {/* Sistema */}
          <View style={styles.section}>
            <FieldLabel label="Sistema de RPG" />
            <Controller
              control={control}
              name="system"
              render={({ field: { onChange, value } }) => (
                <SystemSegmented value={value} onChange={onChange} />
              )}
            />
          </View>

          {/* Botão Forjar Herói */}
          <Pressable
            onPress={handleSubmit(onValid)}
            disabled={isSubmitting}
            style={styles.ctaWrapper}
          >
            <LinearGradient
              colors={Gradients.gold.colors as [string, string]}
              start={Gradients.gold.start}
              end={Gradients.gold.end}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaLabel}>Forjar Herói</Text>
            </LinearGradient>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

export default AddCharacterSheet;

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: Colors.borderDefault,
    width: 40,
  },
  scrollContent: {
    padding: Spacing.xxl,
    paddingBottom: 48,
    gap: Spacing.xxl,
  },
  header: {
    alignItems: "center",
    gap: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  dividerTop: {
    width: 64,
    height: 2,
    backgroundColor: Colors.borderDefault,
    marginBottom: Spacing.md,
    borderRadius: 1,
  },
  headerTitle: {
    ...Typography.display,
    fontSize: 22,
    color: Colors.parchment,
  },
  headerSubtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
  },
  section: {
    gap: 0,
  },
  fieldLabel: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  fieldError: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.crimson,
  },
  textInput: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.parchment,
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  textInputError: {
    borderColor: Colors.crimson,
  },
  // Classe
  classItem: {
    width: 72,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceElevated,
    gap: 2,
  },
  classItemActive: {
    backgroundColor: "rgba(201,168,76,0.20)",
    borderColor: Colors.gold,
  },
  classItemLabel: {
    ...Typography.body,
    fontSize: 10,
    color: Colors.mutedForeground,
    textAlign: "center",
  },
  classItemLabelActive: {
    color: Colors.gold,
  },
  // Raça
  raceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceElevated,
  },
  raceItemActive: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(201,168,76,0.15)",
  },
  raceItemLabel: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
  },
  raceItemLabelActive: {
    color: Colors.gold,
  },
  // Stepper
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  stepBtnDisabled: {
    borderColor: Colors.borderSubtle,
  },
  stepBtnText: {
    ...Typography.bodyBold,
    fontSize: 20,
    color: Colors.parchment,
  },
  levelValue: {
    ...Typography.display,
    fontSize: 28,
    color: Colors.gold,
  },
  levelMax: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  // Sistema
  systemRow: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  systemItem: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    alignItems: "center",
  },
  systemItemActive: {
    backgroundColor: Colors.gold,
  },
  systemItemLabel: {
    ...Typography.bodySemiBold,
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  systemItemLabelActive: {
    color: Colors.background,
  },
  // CTA
  ctaWrapper: {
    borderRadius: Radius.sm,
    overflow: "hidden",
    marginTop: Spacing.md,
  },
  ctaGradient: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
  },
  ctaLabel: {
    ...Typography.display,
    fontSize: 15,
    color: Colors.background,
  },
});
