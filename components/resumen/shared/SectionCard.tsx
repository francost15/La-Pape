import React from "react";
import { AppFonts } from "@/constants/typography";
import { Platform, Text, View, type ViewProps } from "react-native";

interface SectionCardProps extends ViewProps {
  /** Título visible en la parte superior de la card */
  title?: string;
  children: React.ReactNode;
}

/**
 * Contenedor card reutilizable para todas las secciones del resumen.
 *
 * Centraliza: fondo blanco/dark, borde sutil, bordes redondeados y sombra mínima.
 * El título sigue el estilo editorial: small-caps uppercase, tamaño pequeño,
 * para que el contenido sea el foco visual — no el encabezado.
 */
export default function SectionCard({
  title,
  children,
  style,
  className: extraClassName,
  ...viewProps
}: SectionCardProps) {
  return (
    <View
      {...viewProps}
      className={[
        "rounded-xl border border-gray-100/60 bg-white p-4 dark:border-neutral-700/50 dark:bg-neutral-800",
        extraClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      style={[
        Platform.OS === "web" ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" } : { elevation: 1 },
        style,
      ]}
    >
      {title ? (
        <Text
          className="mb-3 text-[10px] font-semibold text-gray-400 uppercase dark:text-gray-500"
          style={{ fontFamily: AppFonts.bodyStrong, letterSpacing: 1.4 }}
          accessibilityRole="header"
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}
