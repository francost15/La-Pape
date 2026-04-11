import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  style?: ViewStyle;
  className?: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}

export function Skeleton({ style, className, width, height, borderRadius = 8 }: SkeletonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1, // Infinito
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const backgroundColor = isDark ? "#1E2433" : "#E5E7EB";

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}
