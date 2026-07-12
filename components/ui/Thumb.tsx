import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import React, { useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

interface ThumbProps {
  /** URL de la imagen; si es vacía/nula o falla la carga se muestra el fallback. */
  uri?: string | null;
  /** Lado del thumbnail en px cuando no se controla el tamaño vía className. */
  size?: number;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Clave de reciclaje para FlashList/FlatList (evita imágenes cruzadas). */
  recyclingKey?: string;
  /** Ícono SF Symbol del fallback por defecto. */
  iconName?: IconSymbolName;
  iconSize?: number;
  iconColor?: string;
  /** Fallback custom; si se pasa, reemplaza al ícono. */
  fallback?: React.ReactNode;
}

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
  iconColor,
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
