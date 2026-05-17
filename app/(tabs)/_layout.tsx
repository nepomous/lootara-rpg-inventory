import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Backpack, BookOpen, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Gradients, Shadows, Typography } from "@/constants/theme";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    // LinearGradient como background global da área de tabs
    <LinearGradient
      colors={Gradients.tome.colors as [string, string]}
      start={Gradients.tome.start}
      end={Gradients.tome.end}
      style={StyleSheet.absoluteFill}
    >
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.gold,
          headerTitleStyle: {
            ...Typography.displayMd,
            fontSize: 16,
            color: Colors.parchment,
          },
          // Background transparente para o gradiente aparecer
          sceneStyle: { backgroundColor: "transparent" },
          tabBarStyle: {
            position: "absolute",
            left: 16,
            right: 16,
            bottom: insets.bottom > 0 ? insets.bottom : 8,
            height: 64,
            backgroundColor: "rgba(26,26,46,0.92)",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: Colors.borderDefault,
            borderTopWidth: 1,
            borderTopColor: Colors.borderDefault,
            elevation: Shadows.card.elevation,
            shadowColor: Shadows.card.shadowColor,
            shadowOffset: Shadows.card.shadowOffset,
            shadowOpacity: Shadows.card.shadowOpacity,
            shadowRadius: Shadows.card.shadowRadius,
          },
          tabBarActiveTintColor: Colors.gold,
          tabBarInactiveTintColor: Colors.mutedForeground,
          tabBarLabelStyle: {
            ...Typography.bodySemiBold,
            fontSize: 10,
          },
          tabBarItemStyle: {
            paddingVertical: 6,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Heróis",
            tabBarIcon: ({ color, size }) => (
              <Backpack size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: "Biblioteca",
            tabBarIcon: ({ color, size }) => (
              <BookOpen size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Configurações",
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} strokeWidth={1.8} />
            ),
          }}
        />
      </Tabs>
    </LinearGradient>
  );
}
