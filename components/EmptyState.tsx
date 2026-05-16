import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Colors,
  Gradients,
  Radius,
  Spacing,
  Typography,
} from "@/constants/theme";

type EmptyStateProps = {
  emoji: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export default function EmptyState({
  emoji,
  title,
  subtitle,
  ctaLabel,
  onCta,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {ctaLabel && onCta ? (
        <Pressable onPress={onCta} style={styles.ctaWrapper}>
          <LinearGradient
            colors={Gradients.gold.colors as [string, string]}
            start={Gradients.gold.start}
            end={Gradients.gold.end}
            style={styles.cta}
          >
            <Text style={styles.ctaLabel}>{ctaLabel}</Text>
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.display,
    fontSize: 18,
    color: Colors.parchment,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xxl,
  },
  ctaWrapper: {
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
  cta: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.sm,
  },
  ctaLabel: {
    ...Typography.display,
    fontSize: 14,
    color: Colors.background,
  },
});
