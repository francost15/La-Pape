import { IconSymbol } from "@/components/ui/icon-symbol";
import type { ProductImageDisplayProps } from "@/interface/products";
import { Image } from "expo-image";
import { Text, View } from "react-native";

/**
 * Muestra la imagen del producto con contentFit="contain" para no recortar.
 * Si no hay imagen o falla la carga, muestra un placeholder con ícono.
 * Reutilizado en detalle y (si se necesita) en otros contextos de solo lectura.
 */
export default function ProductImageDisplay({
  uri,
  hasImg,
  onError,
  accessibilityLabel,
}: ProductImageDisplayProps) {
  if (hasImg) {
    return (
      <Image
        source={{ uri }}
        contentFit="contain"
        style={{ width: "100%", height: "100%" }}
        onError={onError}
        accessibilityLabel={accessibilityLabel ?? "Imagen del producto"}
        accessibilityRole="image"
      />
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-2">
      <IconSymbol name="photo.fill" size={40} color="#d1d5db" />
      <Text className="text-[12px] text-gray-400 dark:text-gray-600">Sin imagen</Text>
    </View>
  );
}
