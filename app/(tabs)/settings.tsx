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
  FileText,
  Lock,
  Mail,
  RefreshCw,
  Upload,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";
import { LanguageSelector } from "@/components/LanguageSelector";
import { usePremium } from "@/hooks/usePremium";
import { exportData, importData } from "@/utils/backup";
import { useQueryClient } from "@tanstack/react-query";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const KOFI_URL = "https://ko-fi.com/nepomous";
const PRIVACY_URL = "https://v0-lootara-marketing-site.vercel.app/privacy";
const TERMS_URL = "https://v0-lootara-marketing-site.vercel.app/terms";
const SUPPORT_EMAIL = "lootara.support@gmail.com";

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
  const { t } = useTranslation();
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
          title={t("settings.premium_active")}
          subtitle={t("settings.premium_active_subtitle")}
          right={
            <View className="px-2 py-1 rounded-full bg-primary/20">
              <Text className="text-primary text-xs font-bold">
                {t("settings.premium_badge")}
              </Text>
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
        title={t("settings.remove_ads_title")}
        subtitle={
          offerPrice
            ? t("settings.premium_offer_price", { price: offerPrice })
            : t("settings.premium_default_price")
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
              <Text className="text-background text-xs font-bold">
                {t("settings.premium_buy_button")}
              </Text>
            )}
          </Pressable>
        }
      />
      <Divider />
      <CardRow
        icon={<RefreshCw size={22} color="#8a8a9a" />}
        title={t("settings.restore_purchase")}
        subtitle={t("settings.restore_subtitle")}
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
  const { t } = useTranslation();
  return (
    <Card>
      <CardRow
        icon={<Coffee size={22} color="#c9a84c" />}
        title={t("settings.support_title")}
        subtitle={t("settings.support_subtitle")}
        onPress={() => Linking.openURL(KOFI_URL).catch(() => {})}
        right={<Text className="text-text-muted text-lg">›</Text>}
      />
    </Card>
  );
}

// ── Card Backup ───────────────────────────────────────────────────────────────
function BackupCard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await exportData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("errors.generic");
      Alert.alert(t("common.error"), msg);
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
        t("settings.backup_success_title"),
        t("settings.backup_success_message", {
          characters: result.characters,
          bagItems: result.bagItems,
          customItems: result.customItems,
        }),
      );
    } catch (e) {
      if (e instanceof Error && e.message === "CANCELLED") {
        return;
      }
      const msg = e instanceof Error ? e.message : t("errors.generic");
      Alert.alert(t("common.error"), msg);
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card>
      <CardRow
        icon={<Upload size={22} color="#8a8a9a" />}
        title={t("settings.backup_export")}
        subtitle={t("settings.backup_export_subtitle")}
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
        title={t("settings.backup_import")}
        subtitle={t("settings.backup_import_subtitle")}
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

// ── Card Legal ────────────────────────────────────────────────────────────────
function LegalCard() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardRow
        icon={<Mail size={22} color="#8a8a9a" />}
        title={t("settings.contact_support_title")}
        subtitle={t("settings.contact_support_subtitle")}
        onPress={() =>
          Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {})
        }
        right={<Text className="text-text-muted text-lg">›</Text>}
      />
      <Divider />
      <CardRow
        icon={<Lock size={22} color="#8a8a9a" />}
        title={t("settings.privacy_policy")}
        subtitle={t("settings.privacy_policy_subtitle")}
        onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})}
        right={<Text className="text-text-muted text-lg">›</Text>}
      />
      <Divider />
      <CardRow
        icon={<FileText size={22} color="#8a8a9a" />}
        title={t("settings.terms_of_use")}
        subtitle={t("settings.terms_of_use_subtitle")}
        onPress={() => Linking.openURL(TERMS_URL).catch(() => {})}
        right={<Text className="text-text-muted text-lg">›</Text>}
      />
    </Card>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      {/* Header */}
      <View className="px-4 pt-6 pb-4">
        <Text className="text-text text-2xl font-bold">
          {t("settings.title")}
        </Text>
        <Text className="text-text-muted text-sm mt-1">
          {t("settings.header_subtitle")}
        </Text>
      </View>

      <SectionTitle title={t("settings.section_premium")} />
      <PremiumCard />

      <SectionTitle title={t("settings.language_title")} />
      <View className="mx-4">
        <LanguageSelector />
      </View>

      <SectionTitle title={t("settings.section_support")} />
      <SupportCard />

      <SectionTitle title={t("settings.backup_title")} />
      <BackupCard />

      {/* Aviso sobre dados locais */}
      <View className="mx-4 mt-3 p-3 rounded-xl bg-background-surface flex-row items-start gap-2">
        <AlertCircle size={16} color="#8a8a9a" style={{ marginTop: 1 }} />
        <Text className="text-text-muted text-xs flex-1">
          {t("settings.backup_warning")}
        </Text>
      </View>

      <SectionTitle title={t("settings.section_legal")} />
      <LegalCard />

      {/* Versão do app */}
      <View className="items-center mt-8">
        <Text className="text-text-muted text-xs">Lootara - RPG Inventory</Text>
        <Text className="text-border text-xs">
          {t("settings.version", { version: APP_VERSION })}
        </Text>
      </View>
    </ScrollView>
  );
}
