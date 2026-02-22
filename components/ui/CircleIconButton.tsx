import type { IconSymbolName } from "@/components/ui/icon-symbol";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";

type Variant = "primary" | "secondary" | "success";

interface CircleIconButtonProps {
  icon: IconSymbolName;
  variant?: Variant;
  onPress: () => void;
  size?: number;
  /** Cuando false, renderiza como View (solo visual) para usar dentro de otro Pressable */
  interactive?: boolean;
}

export default function CircleIconButton({
  icon,
  variant = "primary",
  onPress,
  size = 36,
  interactive = true,
}: CircleIconButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const bgClass =
    variant === "primary"
      ? "bg-orange-500"
      : variant === "success"
        ? "bg-green-600"
        : "bg-gray-200 dark:bg-neutral-700";
  const iconColor =
    variant === "primary" || variant === "success"
      ? "#ffffff"
      : isDark
        ? "#d4d4d4"
        : "#4b5563";

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const buttonStyle = { width: size, height: size };
  const content = (
    <>
      <IconSymbol name={icon} size={size * 0.56} color={iconColor} />
    </>
  );

  if (!interactive) {
    return (
      <View
        className={`${bgClass} items-center justify-center rounded-full`}
        style={buttonStyle}
      >
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      className={`${bgClass} items-center justify-center rounded-full active:opacity-90`}
      style={buttonStyle}
    >
      {content}
    </TouchableOpacity>
  );
}
