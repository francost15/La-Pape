import { Thumb } from "@/components/ui/Thumb";
import React from "react";
import { View } from "react-native";

/**
 * Miniatura 36px de las listas de resumen (ranking / bajo stock). Comparte el
 * fallback de caja gris para mantener consistencia entre ambas listas.
 */
export function ResumenThumb({ uri }: { uri?: string | null }) {
  return (
    <Thumb
      uri={uri}
      size={36}
      borderRadius={8}
      className="shrink-0 bg-[#F5F5F4] dark:bg-[#1A1F2B]"
      fallback={<View className="h-4 w-4 rounded bg-[#E5E7EB] dark:bg-[#2A3040]" />}
    />
  );
}
