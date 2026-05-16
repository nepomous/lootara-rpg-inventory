import { Alert, Pressable, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { getItemById } from "@/constants/items";
import { ITEM_CATEGORIES, BAG_LOCATIONS } from "@/constants/rpg";
import type { BagItem, BagItemLocation } from "@/db/schema";
import { formatWeight } from "@/utils/weight";

type Props = {
  item: BagItem;
  onEdit: (item: BagItem) => void;
  onRemove: (id: string) => void;
};

const LOCATION_COLORS: Record<BagItemLocation, string> = {
  equipped: "#22c55e",
  backpack: "#3b82f6",
  stored: "#9ca3af",
};

const SWIPE_THRESHOLD = -80;
const ROW_HEIGHT = 72;

export function ItemRow({ item, onEdit, onRemove }: Props) {
  const staticItem = item.itemId ? getItemById(item.itemId) : null;
  const displayName =
    staticItem?.name ?? item.customName ?? "Item personalizado";
  const categoryInfo = staticItem
    ? ITEM_CATEGORIES[staticItem.category]
    : { emoji: "🎁", label: "Custom" };
  const locationInfo = BAG_LOCATIONS[item.location];
  const locationColor = LOCATION_COLORS[item.location];
  const weightText = staticItem
    ? formatWeight(staticItem.weight * item.quantity)
    : null;

  const translateX = useSharedValue(0);
  const deleteVisible = useSharedValue(false);

  function triggerRemove() {
    Alert.alert("Remover item", `Remover "${displayName}" da sacola?`, [
      {
        text: "Cancelar",
        style: "cancel",
        onPress: () => {
          translateX.value = withSpring(0);
        },
      },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => onRemove(item.id),
      },
    ]);
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      // Só permite swipe para a esquerda
      const val = Math.min(0, e.translationX);
      translateX.value = Math.max(-100, val);
      deleteVisible.value = translateX.value < SWIPE_THRESHOLD;
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-80);
      } else {
        translateX.value = withSpring(0);
        deleteVisible.value = false;
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: withTiming(deleteVisible.value ? 1 : 0),
  }));

  return (
    <GestureHandlerRootView>
      <View className="mx-4 mb-2" style={{ height: ROW_HEIGHT }}>
        {/* Botão de delete que aparece atrás */}
        <Animated.View
          style={[
            deleteStyle,
            {
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 80,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 12,
              backgroundColor: "#ef4444",
            },
          ]}
        >
          <Pressable
            onPress={() => runOnJS(triggerRemove)()}
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className="text-white text-2xl">🗑️</Text>
          </Pressable>
        </Animated.View>

        {/* Linha principal animada */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={rowStyle}
            className="flex-1 rounded-xl bg-background-card border border-border flex-row items-center px-3 gap-3"
          >
            {/* Ícone da categoria */}
            <View className="w-10 h-10 rounded-lg bg-background-surface items-center justify-center">
              <Text className="text-xl">{categoryInfo.emoji}</Text>
            </View>

            {/* Info */}
            <Pressable className="flex-1 gap-0.5" onPress={() => onEdit(item)}>
              <Text
                className="text-text text-sm font-semibold"
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <View className="flex-row items-center gap-2">
                {weightText ? (
                  <Text className="text-text-muted text-xs">{weightText}</Text>
                ) : null}
                <View
                  className="px-2 py-0.5 rounded-chip"
                  style={{ backgroundColor: locationColor + "22" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: locationColor }}
                  >
                    {locationInfo.emoji} {locationInfo.label}
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Quantidade */}
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-background-surface items-center justify-center">
                <Text className="text-primary text-sm font-bold">
                  {item.quantity}
                </Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}
