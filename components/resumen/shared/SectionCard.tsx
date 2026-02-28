import React from "react";
import { Platform, Text, View, type ViewProps } from "react-native";

interface SectionCardProps extends ViewProps {
  /** Título visible en la parte superior de la card */
  title?: string;
  children: React.ReactNode;
}

/**
 * Contenedor card reutilizable para todas las secciones del resumen.
 *
 * Centraliza: fondo blanco/dark, bordes, bordes redondeados y sombra.
 * El className externo (ej: "flex-1 min-w-0") se concatena al base
 * en lugar de sobreescribirse, lo que permite componer layouts flex correctamente.
 */
export default function SectionCard({
  title,
  children,
  style,
  // Extraemos className para hacer merge en lugar de override
  className: extraClassName,
  ...viewProps
}: SectionCardProps) {
  return (
    <View
      {...viewProps}
      className={[
        "bg-white dark:bg-neutral-800 rounded-xl p-4 border border-gray-100/80 dark:border-neutral-700",
        extraClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      style={[
        Platform.OS === "web"
          ? { boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }
          : { elevation: 1 },
        style,
      ]}
    >
      {title ? (
        <Text className="text-[15px] font-bold text-gray-800 dark:text-gray-100 mb-3">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
