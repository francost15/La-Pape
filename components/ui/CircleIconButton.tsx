import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

type Variant = "primary" | "secondary" | "success";

interface CircleIconButtonProps {
  icon: IconSymbolName;
  variant?: Variant;
  onPress: () => void;
  size?: number;
  /** Cuando false, renderiza como View (solo visual) para usar dentro de otro Pressable */
  interactive?: boolean;
  accessibilityLabel?: string;
}

// Spring corto y firme: el botón se hunde al tacto y vuelve rápido.
const PRESS_SPRING = { damping: 15, stiffness: 400, mass: 0.5 };

export default function CircleIconButton({
  icon,
  variant = "primary",
  onPress,
  size = 36,
  interactive = true,
  accessibilityLabel,
}: CircleIconButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const haptic = useHaptic();
  const reduceMotion = useReducedMotion();

  const bgClass =
    variant === "primary"
      ? "bg-orange-500"
      : variant === "success"
        ? "bg-green-600"
        : "bg-gray-200 dark:bg-neutral-700";
  const iconColor =
    variant === "primary" || variant === "success" ? "#ffffff" : isDark ? "#d4d4d4" : "#4b5563";

  // Feedback táctil por escala: hace que el control se sienta "vivo",
  // como si escuchara al dedo. La opacidad sola se percibe inerte.
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    haptic();
    onPress();
  };

  const buttonStyle = { width: size, height: size };
  const content = <IconSymbol name={icon} size={size * 0.56} color={iconColor} />;

  if (!interactive) {
    return (
      <View className={`${bgClass} items-center justify-center rounded-full`} style={buttonStyle}>
        {content}
      </View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={() => {
          if (!reduceMotion) scale.value = withSpring(0.94, PRESS_SPRING);
        }}
        onPressOut={() => {
          if (!reduceMotion) scale.value = withSpring(1, PRESS_SPRING);
        }}
        className={`${bgClass} items-center justify-center rounded-full`}
        style={buttonStyle}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? icon}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}
