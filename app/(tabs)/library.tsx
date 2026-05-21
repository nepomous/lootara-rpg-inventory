import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

// Placeholder — implementado na Etapa 4
export default function LibraryScreen() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-5xl mb-4">📚</Text>
      <Text className="text-text text-lg font-bold">{t("library.title")}</Text>
      <Text className="text-text-muted text-sm mt-2">
        {t("common.loading")}
      </Text>
    </View>
  );
}
