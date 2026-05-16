import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#1a1a2e" },
        headerTintColor: "#e8c547",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarStyle: {
          backgroundColor: "#16213e",
          borderTopColor: "#0f3460",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#e8c547",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Personagens",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🧙" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Biblioteca",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Configurações",
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
