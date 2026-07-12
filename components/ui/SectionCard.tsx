import React from "react";
import { View, type ViewProps } from "react-native";

export interface SectionCardProps extends ViewProps {
  /** Título visible en la parte superior de la card (hoy lo maneja el padre vía SectionTitle) */
  title?: string;
  children: React.ReactNode;
}

/**
 * SectionCard — Digital Atelier style.
 *
 * Contenedor FLAT — sin borde, sin sombra, sin chrome de card.
 * Solo padding transparente con título opcional; el título de sección (si
 * hay) lo pinta la pantalla padre vía SectionTitle. Este wrapper existe
 * únicamente para layout.
 *
 * Promovido desde components/resumen/shared/ para uso en toda la app
 * (esa ruta queda como re-export de compatibilidad).
 */
export default function SectionCard({
  title: _title,
  children,
  style,
  className: extraClassName,
  ...viewProps
}: SectionCardProps) {
  return (
    <View {...viewProps} className={[extraClassName].filter(Boolean).join(" ")} style={[style]}>
      {children}
    </View>
  );
}
