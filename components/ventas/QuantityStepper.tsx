import CircleIconButton from "@/components/ui/CircleIconButton";
import type { QuantityStepperProps } from "@/interface/ventas";
import { AppFonts } from "@/constants/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";
import React from "react";
import { Text, View } from "react-native";

/**
 * QuantityStepper — Digital Atelier style.
 */
// El círculo de 36px es intencional (stepper compacto en filas del carrito);
// CircleIconButton añade hitSlop automático para que el área táctil efectiva
// sea ≥44pt sin alterar el diseño. El gap de 12 + texto de 28 evita solapes.
export default function QuantityStepper({
  quantity,
  onMinus,
  onPlus,
  size = 36,
}: QuantityStepperProps) {
  const { colors } = useThemeColors();

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
