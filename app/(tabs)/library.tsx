import { Text, View } from "react-native";

// Placeholder — implementado na Etapa 4
export default function LibraryScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-5xl mb-4">📚</Text>
      <Text className="text-text text-lg font-bold">Biblioteca de Itens</Text>
      <Text className="text-text-muted text-sm mt-2">Em breve...</Text>
    </View>
  );
}
