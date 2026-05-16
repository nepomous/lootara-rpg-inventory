import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  Sword,
  Shield,
  Package,
  FlaskConical,
  Wrench,
  Sparkles,
  Crosshair,
  Archive,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { Item, ItemRarity } from "@/constants/items";
import type { BagItemLocation } from "@/constants/rpg";
import { Colors, Shadows, Spacing, Typography } from "@/constants/theme";
import type { BagItem } from "@/db/schema";
import { formatWeight } from "@/utils/weight";

// Mapeamento de categoria → ícone lucide
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  weapon: Sword,
  armor: Shield,
  gear: Package,
  potion: FlaskConical,
  tool: Wrench,
  magic: Sparkles,
  ammunition: Crosshair,
  container: Archive,
};

// Mapeamento de raridade para a chave de Colors.rarity
const RARITY_COLOR_KEY: Record<ItemRarity, keyof typeof Colors.rarity> = {
  common: "common",
  uncommon: "uncommon",
  rare: "rare",
  very_rare: "veryRare",
  legendary: "legendary",
};

type Props = {
  item: Item;
  bagItem: BagItem;
  onRemove: (id: string) => void;
  onChangeLocation: (id: string, location: BagItemLocation) => void;
  onChangeQuantity: (id: string, quantity: number) => void;
};

export function ItemRow({
  item,
  bagItem,
  onRemove,
  onChangeLocation,
  onChangeQuantity,
}: Props) {
  const CategoryIcon = CATEGORY_ICONS[item.category] ?? Package;
  const rarityColor = Colors.rarity[RARITY_COLOR_KEY[item.rarity]];
  const weightText = formatWeight(item.weight * bagItem.quantity);

  // Animação de expand/collapse
  const expanded = useSharedValue(false);
  const descriptionHeight = useSharedValue(0);

  const descriptionStyle = useAnimatedStyle(() => ({
    height: withTiming(expanded.value ? descriptionHeight.value : 0, {
      duration: 250,
    }),
    overflow: "hidden",
  }));

  function toggleExpand() {
    expanded.value = !expanded.value;
  }

  function showActionMenu() {
    const LOCATIONS: BagItemLocation[] = ["equipped", "backpack", "stored"];
    const LOCATION_LABELS: Record<BagItemLocation, string> = {
      equipped: "Equipar",
      backpack: "Mover para Sacola",
      stored: "Guardar",
    };

    Alert.alert(item.name, "O que deseja fazer?", [
      ...LOCATIONS.filter((l) => l !== bagItem.location).map((l) => ({
        text: LOCATION_LABELS[l],
        onPress: () => onChangeLocation(bagItem.id, l),
      })),
      {
        text: `Consumir (qtd: ${bagItem.quantity})`,
        onPress: () => {
          if (bagItem.quantity <= 1) {
            onRemove(bagItem.id);
          } else {
            onChangeQuantity(bagItem.id, bagItem.quantity - 1);
          }
        },
      },
      {
        text: "Remover",
        style: "destructive",
        onPress: () =>
          Alert.alert("Remover item", `Remover "${item.name}" da sacola?`, [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Remover",
              style: "destructive",
              onPress: () => onRemove(bagItem.id),
            },
          ]),
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  }

  return (
    <Pressable
      onPress={toggleExpand}
      onLongPress={showActionMenu}
      delayLongPress={400}
      style={styles.card}
    >
      {/* Linha principal */}
      <View className="flex-row items-center gap-3 px-3 py-3">
        {/* Ponto de raridade */}
        <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />

        {/* Ícone da categoria */}
        <View
          style={styles.iconContainer}
          className="items-center justify-center"
        >
          <CategoryIcon size={18} color={Colors.gold} />
        </View>

        {/* Nome + peso */}
        <View className="flex-1 gap-0.5">
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.weightText}>{weightText}</Text>
        </View>

        {/* Badge de quantidade */}
        <View
          style={styles.quantityBadge}
          className="items-center justify-center"
        >
          <Text style={styles.quantityText}>{bagItem.quantity}</Text>
        </View>
      </View>

      {/* Descrição expansível */}
      <Animated.View style={descriptionStyle}>
        <View
          className="px-3 pb-3"
          onLayout={(e) => {
            descriptionHeight.value = e.nativeEvent.layout.height + 12;
          }}
        >
          <View style={styles.divider} />
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: "hidden",
    ...Shadows.card,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(201,168,76,0.10)",
  },
  itemName: {
    ...Typography.bodySemiBold,
    fontSize: 14,
    color: Colors.parchment,
  },
  weightText: {
    ...Typography.body,
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  quantityBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderDefault,
  },
  quantityText: {
    ...Typography.bodyBold,
    fontSize: 12,
    color: Colors.gold,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    fontSize: 12,
    color: Colors.mutedForeground,
    lineHeight: 18,
  },
});

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
