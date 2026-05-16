import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typography, Spacing } from "@/constants/theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showDivider?: boolean;
};

export default function AppHeader({
  title,
  subtitle,
  showDivider = false,
}: AppHeaderProps) {
  return (
    <View className="px-5 pt-4 pb-2">
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {showDivider ? (
        <View className="mt-3 h-px overflow-hidden">
          <LinearGradient
            colors={["transparent", Colors.gold, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.display,
    fontSize: 22,
    color: Colors.parchment,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
  },
});
