import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { Text, View } from "react-native";

interface EmptyStateProps {
  /** Mensaje a mostrar debajo del ícono */
  message: string;
  /** Nombre del SF Symbol (opcional). Si no se pasa, solo muestra el texto. */
  iconName?: string;
}

/**
 * Estado vacío reutilizable para secciones del resumen.
 * Muestra un ícono centrado (opcional) + mensaje descriptivo.
 */
export default function EmptyState({ message, iconName }: EmptyStateProps) {
  return (
    <View className="py-8 items-center gap-2">
      {iconName ? (
        <IconSymbol name={iconName as any} size={28} color="#9ca3af" />
      ) : null}
      <Text className="text-[13px] text-gray-400 dark:text-gray-500 text-center">
        {message}
      </Text>
    </View>
  );
}
