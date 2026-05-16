import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import { Colors, Gradients, Shadows } from "@/constants/theme";

type FABProps = {
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FAB({ onPress }: FABProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withSpring(0.95, { damping: 12 });
  }

  function handlePressOut() {
    scale.value = withSpring(1, { damping: 12 });
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.fab, animatedStyle]}
    >
      <LinearGradient
        colors={Gradients.gold.colors as [string, string]}
        start={Gradients.gold.start}
        end={Gradients.gold.end}
        style={styles.gradient}
      >
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 88,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    ...Shadows.goldGlow,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
