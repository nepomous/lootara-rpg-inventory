import React, { forwardRef, useCallback, useEffect, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  MAX_LEVEL,
  MIN_LEVEL,
  getClassesBySystem,
  getRaceLabel,
  getRacesBySystem,
  type RPGSystem,
} from "@/constants/rpg";
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

type ClassEntry = {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly group?: string;
};

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
  entries,
}: {
  value: string;
  onChange: (v: string) => void;
  entries: readonly ClassEntry[];
}) {
  const hasGroups = entries.some((e) => e.group != null);

  const renderItem = (item: ClassEntry) => {
    const selected = value === item.id;
    return (
      <Pressable
        key={item.id}
        onPress={() => onChange(item.id)}
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
    <View style={{ gap: Spacing.md }}>
      {groupOrder.map((group) => (
        <View key={group}>
          <Text style={styles.groupHeader}>{group}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
  races: readonly string[];
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {races.map((race) => {
        const selected = value === race;
        return (
          <Pressable
            key={race}
            onPress={() => onChange(race)}
            style={[styles.raceItem, selected && styles.raceItemActive]}
          >
            <Text
              style={[
                styles.raceItemLabel,
                selected && styles.raceItemLabelActive,
              ]}
            >
              {race}
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
      setValue,
      watch,
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

    const selectedSystem = watch("system");
    const systemClasses = getClassesBySystem(
      selectedSystem,
    ) as readonly ClassEntry[];
    const systemRaces = getRacesBySystem(selectedSystem);

    useEffect(() => {
      setValue("class", "");
      setValue("race", "");
    }, [selectedSystem]);

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
                <ClassGrid
                  value={value}
                  onChange={onChange}
                  entries={systemClasses}
                />
              )}
            />
          </View>

          {/* Raça / Ancestral */}
          <View style={styles.section}>
            <FieldLabel
              label={getRaceLabel(selectedSystem)}
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
  groupHeader: {
    ...Typography.bodySemiBold,
    fontSize: 10,
    color: Colors.gold,
    textTransform: "uppercase" as const,
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
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
