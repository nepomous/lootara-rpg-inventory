import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { useLanguage, type SupportedLocale } from "@/hooks/useLanguage";

export function LanguageSelector() {
  const { t } = useTranslation();
  const { currentLocale, changeLanguage, supportedLocales } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t("settings.language_title")}</Text>
      <Text style={styles.sectionSubtitle}>
        {t("settings.language_subtitle")}
      </Text>
      <View style={styles.list}>
        {supportedLocales.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <Pressable
              key={locale}
              style={({ pressed }) => [
                styles.row,
                isActive && styles.rowActive,
                pressed && styles.rowPressed,
              ]}
              onPress={() => void changeLanguage(locale as SupportedLocale)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={t(`language.${locale}`)}
            >
              <Text
                style={[styles.localeName, isActive && styles.localeNameActive]}
              >
                {t(`language.${locale}`)}
              </Text>
              {isActive && (
                <Check size={18} color={Colors.gold} strokeWidth={2.5} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.displayMd,
    color: Colors.gold,
    fontSize: 13,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.mutedForeground,
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  list: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  rowActive: {
    backgroundColor: "rgba(201,168,76,0.08)",
  },
  rowPressed: {
    opacity: 0.7,
  },
  localeName: {
    ...Typography.bodySemiBold,
    color: Colors.parchment,
    fontSize: 15,
  },
  localeNameActive: {
    color: Colors.goldSoft,
  },
});
