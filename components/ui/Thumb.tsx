import { IconSymbol } from "@/components/ui/icon-symbol";
import type { ThumbProps } from "@/interface/ui";
import { Image } from "expo-image";
import React, { useState } from "react";
import { View, type ViewStyle } from "react-native";

/**
 * Thumbnail con fallback y estado de error INTERNO.
 *
 * Reemplaza las ~6 reimplementaciones inline de `<Image onError>` +
 * `useState(imageError)` que había repartidas por la app. El caller solo pasa
 * la `uri`; el manejo de error vive aquí.
 */
export function Thumb({
  uri,
  size,
  borderRadius,
  className,
  style,
  recyclingKey,
  iconName = "photo.fill",
  iconSize = 20,
  iconColor = "#C7C7CC",
  fallback,
}: ThumbProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(uri?.trim()) && !imageError;

  const sizeStyle: ViewStyle | undefined = size != null ? { width: size, height: size } : undefined;

  return (
    <View
      className={className}
      style={[{ overflow: "hidden" }, borderRadius != null && { borderRadius }, sizeStyle, style]}
    >
      {hasImage ? (
        <Image
          source={{ uri: uri! }}
          contentFit="cover"
          style={{ width: "100%", height: "100%" }}
          recyclingKey={recyclingKey}
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="h-full w-full items-center justify-center">
          {fallback ?? <IconSymbol name={iconName} size={iconSize} color={iconColor} />}
        </View>
      )}
    </View>
  );
}
