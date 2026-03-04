import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Platform, StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AnimatedScreenProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const TIMING_CONFIG = {
  duration: 260,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export default function AnimatedScreen({
  children,
  style,
  className,
}: AnimatedScreenProps) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isFocused) {
      if (reduceMotion) {
        opacity.value = 1;
        translateY.value = 0;
      } else {
        opacity.value = 0;
        translateY.value = 6;
        opacity.value = withTiming(1, TIMING_CONFIG);
        translateY.value = withTiming(0, TIMING_CONFIG);
      }
    }
  }, [isFocused, opacity, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[{ flex: 1 }, animatedStyle, style]}
      className={className}
    >
      {children}
    </Animated.View>
  );
}
