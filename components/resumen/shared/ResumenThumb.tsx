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
      className="shrink-0 bg-surface-hover"
      fallback={<View className="h-4 w-4 rounded bg-surface-hover" />}
    />
  );
}
