import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

const SRD_URL = "https://dnd.wizards.com/resources/systems-reference-document";
const CC_BY_URL = "https://creativecommons.org/licenses/by/4.0/legalcode";

const SRD_CC_ATTRIBUTION_TEXT =
  'This application includes material from the System Reference Document 5.1 ("SRD 5.1") and the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 and SRD 5.2.1 are licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. Modifications: item names and descriptions have been translated and adapted by the author. This application is not affiliated with, endorsed, sponsored, or approved by Wizards of the Coast LLC.';

export default function LicensesScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("legal.licenses_screen_title") }} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="bg-background-card border border-border rounded-2xl p-4">
          <Text className="text-text text-sm leading-6">
            {SRD_CC_ATTRIBUTION_TEXT}
          </Text>

          <View className="mt-4 gap-2">
            <Pressable onPress={() => Linking.openURL(SRD_URL).catch(() => {})}>
              <Text className="text-primary text-sm underline">{SRD_URL}</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL(CC_BY_URL).catch(() => {})}
            >
              <Text className="text-primary text-sm underline">
                {CC_BY_URL}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
