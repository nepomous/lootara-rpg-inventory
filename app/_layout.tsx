import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { Cinzel_400Regular, Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import {
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import * as SplashScreen from "expo-splash-screen";
import { runMigrations } from "@/db/index";
import { initPremium } from "@/hooks/usePremium";
import { initI18n } from "@/lib/i18n";
import "../global.css";

// Mantém a splash screen visível até as fontes carregarem
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados locais não expiram — revalidar apenas quando a janela recupera foco
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Componente interno que aguarda inicialização do banco e premium
function AppInitializer({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // 1. Inicializar i18n (detectar idioma do dispositivo / preferência salva)
        await initI18n();
        // 2. Criar / migrar tabelas SQLite
        await runMigrations();
        // 3. Verificar status premium (RevenueCat → SecureStore → Zustand)
        await initPremium();
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Erro ao inicializar o app";
        setError(message);
      } finally {
        setReady(true);
      }
    }

    void init();
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#e8c547" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-error text-lg font-bold mb-2">
          Erro ao iniciar
        </Text>
        <Text className="text-text-muted text-sm text-center">{error}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Mantém a splash screen enquanto as fontes carregam
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#1a1a2e" },
            headerTintColor: "#e8c547",
            headerTitleStyle: { fontWeight: "bold" },
            contentStyle: { backgroundColor: "#1a1a2e" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="character/new"
            options={{ title: "Novo Personagem", presentation: "modal" }}
          />
          <Stack.Screen name="character/[id]" options={{ title: "Sacola" }} />
        </Stack>
      </AppInitializer>
    </QueryClientProvider>
  );
}
