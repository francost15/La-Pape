import { AppFonts } from "@/constants/typography";
import type { UserAvatarProps } from "@/interface/ui";
import { getInitials } from "@/lib/utils/format";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Text, View, type ViewStyle } from "react-native";

/**
 * UserAvatar — foto de perfil circular con fallback a iniciales.
 *
 * Unifica las 4 implementaciones dispersas (navbar, perfil, miembros del
 * equipo, ventas por usuario). El estado de error de la foto vive dentro, y las
 * iniciales salen de `getInitials` (misma regla en toda la app).
 */
export function UserAvatar({ name, photoUri, size = 40, fontSize, style }: UserAvatarProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(photoUri?.trim()) && !photoFailed;
  const dimension: ViewStyle = { width: size, height: size, borderRadius: size / 2 };

  if (showPhoto) {
    return (
      <Image
        source={{ uri: photoUri! }}
        style={[dimension, style as object]}
        contentFit="cover"
        onError={() => setPhotoFailed(true)}
      />
    );
  }

  return (
    <View
      className="items-center justify-center overflow-hidden bg-accent-soft"
      style={[dimension, style]}
    >
      <Text
        className="font-bold text-accent"
        style={{ fontSize: fontSize ?? Math.round(size * 0.38), fontFamily: AppFonts.heading }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}
