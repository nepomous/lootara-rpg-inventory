import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import type { BagItemLocation } from "@/constants/rpg";
import { Colors, Typography, Spacing } from "@/constants/theme";

type Tab = { key: BagItemLocation; label: string };

type InventoryTabsProps = {
  activeTab: BagItemLocation;
  onChange: (tab: BagItemLocation) => void;
};

export default function InventoryTabs({
  activeTab,
  onChange,
}: InventoryTabsProps) {
  const { t } = useTranslation();
  const TABS: Tab[] = [
    { key: "equipped", label: t("bag.tab_equipped") },
    { key: "backpack", label: t("bag.tab_backpack") },
    { key: "stored", label: t("bag.tab_stored") },
  ];

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
