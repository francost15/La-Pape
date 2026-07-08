import type { ProductThumbProps } from "@/interface/products";
import { Image } from "expo-image";
import { View } from "react-native";
import { IconSymbol } from "../../ui/icon-symbol";

/**
 * Thumbnail de producto: imagen con fallback a ícono. Unifica los cuatro
 * renders de imagen que antes se repetían en cada variante de CardProducts.
 */
export function ProductThumb({
  uri,
  hasImage,
  imageError,
  onError,
  iconSize,
  fallbackColor,
  className,
  style,
}: ProductThumbProps) {
  return (
    <View className={className} style={style}>
      {hasImage && !imageError ? (
        <Image source={{ uri }} contentFit="cover" className="h-full w-full" onError={onError} />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <IconSymbol name="photo.fill" size={iconSize} color={fallbackColor} />
        </View>
      )}
    </View>
  );
}
