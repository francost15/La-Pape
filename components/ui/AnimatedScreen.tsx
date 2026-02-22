import { useIsFocused } from "@react-navigation/native";
import React, { useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
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

  useEffect(() => {
    if (isFocused) {
      opacity.value = 0;
      translateY.value = 6;
      opacity.value = withTiming(1, TIMING_CONFIG);
      translateY.value = withTiming(0, TIMING_CONFIG);
    }
  }, [isFocused, opacity, translateY]);

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
