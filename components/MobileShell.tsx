import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Backpack, BookOpen, Settings } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Colors, Shadows, Typography } from "@/constants/theme";

type Tab = {
  name: string;
  label: string;
  icon: LucideIcon;
  href: string;
};

const TABS: Tab[] = [
  { name: "index", label: "Heróis", icon: Backpack, href: "/" },
  { name: "library", label: "Biblioteca", icon: BookOpen, href: "/library" },
  {
    name: "settings",
    label: "Configurações",
    icon: Settings,
    href: "/settings",
  },
];

type MobileShellProps = {
  activeTab: string;
  onTabPress: (href: string) => void;
};

export default function MobileShell({
  activeTab,
  onTabPress,
}: MobileShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { bottom: insets.bottom > 0 ? insets.bottom : 8 },
      ]}
    >
      <BlurView intensity={60} tint="dark" style={styles.blurInner}>
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            return (
              <Pressable
                key={tab.name}
                onPress={() => onTabPress(tab.href)}
                style={styles.tabItem}
              >
                <Icon
                  size={22}
                  color={isActive ? Colors.gold : Colors.mutedForeground}
                  strokeWidth={isActive ? 2.5 : 1.8}
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
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderDefault,
    ...Shadows.card,
  },
  blurInner: {
    backgroundColor: "rgba(26,26,46,0.92)",
  },
  tabRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 4,
  },
  tabLabel: {
    ...Typography.bodySemiBold,
    fontSize: 10,
  },
  tabLabelActive: {
    color: Colors.gold,
  },
  tabLabelInactive: {
    color: Colors.mutedForeground,
  },
});
