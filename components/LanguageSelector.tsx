import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { useLanguage, type SupportedLocale } from "@/hooks/useLanguage";

function LocaleRow({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.row, isActive ? styles.rowActive : null]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: isActive }}
      accessibilityLabel={label}
    >
      <Text
        style={[styles.localeName, isActive ? styles.localeNameActive : null]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={styles.iconSlot}>
        {isActive ? (
          <Check size={18} color={Colors.gold} strokeWidth={2.5} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export function LanguageSelector() {
  const { t } = useTranslation();
  const { currentLocale, changeLanguage, supportedLocales } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        {supportedLocales.map((locale) => (
          <LocaleRow
            key={locale}
            label={t(`language.${locale}`)}
            isActive={locale === currentLocale}
            onPress={() => void changeLanguage(locale as SupportedLocale)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
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
  localeName: {
    ...Typography.bodySemiBold,
    color: Colors.parchment,
    fontSize: 15,
    flex: 1,
  },
  iconSlot: {
    width: 24,
    alignItems: "center" as const,
  },
  localeNameActive: {
    color: Colors.goldSoft,
  },
});
