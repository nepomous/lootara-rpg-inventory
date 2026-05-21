import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Controller, useForm } from "react-hook-form";
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
import type { ItemCategory, ItemRarity } from "@/constants/rpg";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import type { CustomItem } from "@/db/schema";
import { useCustomItems } from "@/hooks/useCustomItems";

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

const schema = z.object({
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
});
type FormValues = z.infer<typeof schema>;

export type CustomItemFormRef = { present: () => void; dismiss: () => void };

type Props = {
  item?: CustomItem;
  onSave: (item: CustomItem) => void;
  onDelete?: (id: string) => void;
};

export const CustomItemForm = forwardRef<CustomItemFormRef, Props>(
  ({ item, onSave, onDelete }, ref) => {
    const { t } = useTranslation();
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["88%"], []);
    const isEdit = !!item;

    useImperativeHandle(ref, () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const { createItemAsync, updateItemAsync, deleteItem } =
      useCustomItems() as ReturnType<typeof useCustomItems>;

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: item
        ? {
            name: item.name,
            category: item.category as FormValues["category"],
            weight: item.weight,
            cost: item.cost,
            rarity: item.rarity as FormValues["rarity"],
            description: item.description ?? "",
          }
        : { name: "", weight: 0, cost: 0, rarity: "common", description: "" },
    });

    useEffect(() => {
      reset(
        item
          ? {
              name: item.name,
              category: item.category as FormValues["category"],
              weight: item.weight,
              cost: item.cost,
              rarity: item.rarity as FormValues["rarity"],
              description: item.description ?? "",
            }
          : { name: "", weight: 0, cost: 0, rarity: "common", description: "" },
      );
    }, [item]);

    const onSubmit = handleSubmit(async (values: FormValues) => {
      try {
        if (isEdit && item) {
          const updated = await updateItemAsync({ id: item.id, data: values });
          onSave(updated);
        } else {
          const created = await createItemAsync(values);
          onSave(created);
          reset();
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
          if (i === -1) reset();
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

          {/* Nome */}
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

          {/* Categoria */}
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
                ).map(([key, info]) => {
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
                        {info.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />
          {errors.category && (
            <Text style={styles.error}>{errors.category.message}</Text>
          )}

          {/* Peso + Custo */}
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
                    onChangeText={(t) => onChange(parseFloat(t) || 0)}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    placeholderTextColor={Colors.mutedForeground}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>
                {t("custom_items.field_cost")} (PO)
              </Text>
              <Controller
                control={control}
                name="cost"
                render={({ field: { onChange, value } }) => (
                  <BottomSheetTextInput
                    value={value !== undefined ? String(value) : "0"}
                    onChangeText={(t) => onChange(parseFloat(t) || 0)}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    placeholderTextColor={Colors.mutedForeground}
                  />
                )}
              />
            </View>
          </View>

          {/* Raridade */}
          <Text style={styles.label}>{t("custom_items.field_rarity")}</Text>
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
                        {info.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />

          {/* Descrição */}
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

          {/* Submit */}
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

          {/* Deletar (apenas edit) */}
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
  chipText: { ...Typography.body, color: Colors.parchment, fontSize: 11 },
  chipTextActive: { color: Colors.gold },
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
});
