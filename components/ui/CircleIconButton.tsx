import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { CircleIconButtonProps } from "@/interface/ui";
import {
  animateCircleButtonPressIn,
  animateCircleButtonPressOut,
} from "@/lib/animations/circle-icon-button";
import React from "react";
import { Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

// Mínimo de área táctil accesible: 44pt (iOS HIG) / ~48dp (Material).
const MIN_TOUCH_TARGET = 44;

export default function CircleIconButton({
  icon,
  variant = "primary",
  onPress,
  size = MIN_TOUCH_TARGET,
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
  // Cuando el círculo visual es menor al mínimo accesible, expandimos el área
  // táctil con hitSlop en lugar de agrandar el botón: preserva el diseño
  // compacto pero garantiza un objetivo efectivo de ≥44pt.
  const touchSlop = size < MIN_TOUCH_TARGET ? Math.ceil((MIN_TOUCH_TARGET - size) / 2) : undefined;
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
        hitSlop={touchSlop}
        onPressIn={() => {
          if (!reduceMotion) animateCircleButtonPressIn(scale);
        }}
        onPressOut={() => {
          if (!reduceMotion) animateCircleButtonPressOut(scale);
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
