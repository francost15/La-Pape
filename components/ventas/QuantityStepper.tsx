import CircleIconButton from "@/components/ui/CircleIconButton";
import React from "react";
import { Text, View } from "react-native";

interface QuantityStepperProps {
  quantity: number;
  onMinus: () => void;
  onPlus: () => void;
  size?: number;
}

export default function QuantityStepper({
  quantity,
  onMinus,
  onPlus,
  size = 36,
}: QuantityStepperProps) {
  return (
    <View className="flex-row items-center shrink-0 gap-2">
      <CircleIconButton icon="minus" variant="secondary" onPress={onMinus} size={size} />
      <Text className="min-w-7 text-center text-base font-semibold text-gray-900 dark:text-white">
        {quantity}
      </Text>
      <CircleIconButton icon="plus" variant="primary" onPress={onPlus} size={size} />
    </View>
  );
}
