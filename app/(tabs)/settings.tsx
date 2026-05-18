import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  AlertCircle,
  Coffee,
  Crown,
  Download,
  RefreshCw,
  Upload,
} from "lucide-react-native";
import Constants from "expo-constants";
import { usePremium } from "@/hooks/usePremium";
import { exportData, importData } from "@/utils/backup";
import { useQueryClient } from "@tanstack/react-query";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const KOFI_URL = "https://ko-fi.com/lootara";

// ── Componentes de card reutilizáveis ─────────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-text-muted text-xs font-semibold uppercase tracking-widest px-4 mb-2 mt-6">
      {title}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-4 bg-background-card border border-border rounded-2xl overflow-hidden">
      {children}
    </View>
  );
}

function CardRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  destructive,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <View className="flex-row items-center gap-3 px-4 py-4">
      <View style={{ width: 32, alignItems: "center" }}>{icon}</View>
      <View className="flex-1">
        <Text
          className={`text-sm font-semibold ${destructive ? "text-red-400" : "text-text"}`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-text-muted text-xs mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} android_ripple={{ color: "#ffffff15" }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

function Divider() {
  return <View className="h-px bg-border mx-4" />;
}

// ── Card Premium ──────────────────────────────────────────────────────────────
function PremiumCard() {
  const {
    isPremium,
    purchasePremium,
    restorePurchases,
    isLoading,
    offerPrice,
  } = usePremium();

  if (isPremium) {
    return (
      <Card>
        <CardRow
          icon={<Crown size={22} color="#c9a84c" />}
          title="Premium ativo"
          subtitle="Anúncios removidos. Obrigado pelo apoio!"
          right={
            <View className="px-2 py-1 rounded-full bg-primary/20">
              <Text className="text-primary text-xs font-bold">ATIVO</Text>
            </View>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardRow
        icon={<Crown size={22} color="#c9a84c" />}
        title="Remover Anúncios"
        subtitle={
          offerPrice ? `Por apenas ${offerPrice}` : "Compra única, para sempre"
        }
        right={
          <Pressable
            onPress={purchasePremium}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-primary items-center min-w-20"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#1a1a2e" />
            ) : (
              <Text className="text-background text-xs font-bold">Comprar</Text>
            )}
          </Pressable>
        }
      />
      <Divider />
      <CardRow
        icon={<RefreshCw size={22} color="#8a8a9a" />}
        title="Restaurar compra"
        subtitle="Já comprou em outro dispositivo?"
        onPress={isLoading ? undefined : restorePurchases}
        right={
          isLoading ? (
            <ActivityIndicator size="small" color="#9ca3af" />
          ) : (
            <Text className="text-text-muted text-lg">›</Text>
          )
        }
      />
    </Card>
  );
}

// ── Card Apoio ────────────────────────────────────────────────────────────────
function SupportCard() {
  return (
    <Card>
      <CardRow
        icon={<Coffee size={22} color="#c9a84c" />}
        title="Apoiar o Dev"
        subtitle="Me pague um café no Ko-fi"
        onPress={() => Linking.openURL(KOFI_URL).catch(() => {})}
        right={<Text className="text-text-muted text-lg">›</Text>}
      />
    </Card>
  );
}

// ── Card Backup ───────────────────────────────────────────────────────────────
function BackupCard() {
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await exportData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao exportar";
      Alert.alert("Erro", msg);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    try {
      const result = await importData();
      await queryClient.invalidateQueries();
      Alert.alert(
        "Importado com sucesso! ✅",
        `${result.characters} personagem(ns) e ${result.bagItems} item(ns) restaurados.`,
      );
    } catch (e) {
      if (e instanceof Error && e.message === "CANCELLED") {
        return;
      }
      const msg = e instanceof Error ? e.message : "Erro ao importar";
      Alert.alert("Erro", msg);
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card>
      <CardRow
        icon={<Upload size={22} color="#8a8a9a" />}
        title="Exportar dados"
        subtitle="Salvar personagens e sacolas em JSON"
        onPress={exporting ? undefined : handleExport}
        right={
          exporting ? (
            <ActivityIndicator size="small" color="#9ca3af" />
          ) : (
            <Text className="text-text-muted text-lg">›</Text>
          )
        }
      />
      <Divider />
      <CardRow
        icon={<Download size={22} color="#8a8a9a" />}
        title="Importar dados"
        subtitle="Restaurar a partir de um arquivo de backup"
        onPress={importing ? undefined : handleImport}
        right={
          importing ? (
            <ActivityIndicator size="small" color="#9ca3af" />
          ) : (
            <Text className="text-text-muted text-lg">›</Text>
          )
        }
      />
    </Card>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <Text className="text-text text-2xl font-bold">Configurações</Text>
        <Text className="text-text-muted text-sm mt-1">
          Personalize sua experiência
        </Text>
      </View>

      <SectionTitle title="Premium" />
      <PremiumCard />

      <SectionTitle title="Apoio" />
      <SupportCard />

      <SectionTitle title="Backup & Restauração" />
      <BackupCard />

      {/* Aviso sobre dados locais */}
      <View className="mx-4 mt-3 p-3 rounded-xl bg-background-surface flex-row items-start gap-2">
        <AlertCircle size={16} color="#8a8a9a" style={{ marginTop: 1 }} />
        <Text className="text-text-muted text-xs flex-1">
          Todos os dados ficam apenas neste dispositivo. Exporte regularmente
          para não perder seu progresso.
        </Text>
      </View>

      {/* Versão do app */}
      <View className="items-center mt-8">
        <Text className="text-text-muted text-xs">Lootara - RPG Inventory</Text>
        <Text className="text-border text-xs">v{APP_VERSION}</Text>
      </View>
    </ScrollView>
  );
}
