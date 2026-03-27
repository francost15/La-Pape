import CircleIconButton from "@/components/ui/CircleIconButton";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Text, View } from "react-native";

interface QuantityStepperProps {
  quantity: number;
  onMinus: () => void;
  onPlus: () => void;
  size?: number;
}

/**
 * QuantityStepper — Digital Atelier style.
 */
export default function QuantityStepper({
  quantity,
  onMinus,
  onPlus,
  size = 36,
}: QuantityStepperProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? AppColors.dark : AppColors.light;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <CircleIconButton icon="minus" variant="secondary" onPress={onMinus} size={size} />
      <Text
        style={{
          minWidth: 28,
          textAlign: "center",
          fontSize: 16,
          fontWeight: "700",
          color: colors.textPrimary,
          fontFamily: AppFonts.bodyStrong,
        }}
      >
        {quantity}
      </Text>
      <CircleIconButton icon="plus" variant="primary" onPress={onPlus} size={size} />
    </View>
  );
}
