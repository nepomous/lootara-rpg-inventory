import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Colors, Spacing, Typography } from "@/constants/theme";

type CategoryChipProps = {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onPress: () => void;
};

export default function CategoryChip({
  label,
  icon: Icon,
  active,
  onPress,
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Icon size={14} color={active ? Colors.background : Colors.gold} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  label: {
    ...Typography.bodySemiBold,
    fontSize: 12,
    color: Colors.gold,
  },
  labelActive: {
    color: Colors.background,
  },
});
