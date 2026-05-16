import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { BagItemLocation } from "@/constants/rpg";
import { Colors, Typography, Spacing } from "@/constants/theme";

type Tab = { key: BagItemLocation; label: string };

const TABS: Tab[] = [
  { key: "equipped", label: "Equipado" },
  { key: "backpack", label: "Sacola" },
  { key: "stored", label: "Guardado" },
];

type InventoryTabsProps = {
  activeTab: BagItemLocation;
  onChange: (tab: BagItemLocation) => void;
};

export default function InventoryTabs({
  activeTab,
  onChange,
}: InventoryTabsProps) {
  return (
    <View className="flex-row gap-2 px-4 py-2">
      {TABS.map((tab) => (
        <TabPill
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={() => onChange(tab.key)}
        />
      ))}
    </View>
  );
}

type TabPillProps = {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
};

function TabPill({ tab, isActive, onPress }: TabPillProps) {
  const opacity = useSharedValue(isActive ? 1 : 0);

  const activeBgStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isActive ? 1 : 0, { duration: 200 }),
  }));

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <Pressable onPress={handlePress} style={styles.tabBase}>
      {/* Fundo ativo (gold) com fade */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.activeBg, activeBgStyle]}
      />
      <Text
        style={[
          styles.tabLabel,
          isActive ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabBase: {
    flex: 1,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  activeBg: {
    backgroundColor: Colors.gold,
    borderRadius: 9999,
  },
  tabLabel: {
    ...Typography.bodySemiBold,
    fontSize: 13,
  },
  tabLabelActive: {
    color: Colors.background,
  },
  tabLabelInactive: {
    color: Colors.gold,
  },
});
