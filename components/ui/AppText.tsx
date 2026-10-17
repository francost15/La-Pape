import { AppFonts } from "@/constants/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";
import React from "react";
import { Platform, Text, type TextStyle } from "react-native";
import type { ThemeColors } from "@/interface/theme";
import type { AppTextProps, AppTextVariant } from "@/interface/ui";

/**
 * AppText — primitiva de texto canónica.
 *
 * Fija familia, tamaño, lineHeight, letterSpacing y color por defecto según
 * el rol tipográfico. Canoniza la escala que ya usa la app (no la rediseña):
 *
 * - display    32/38  Space Grotesk Bold      — KPIs, precios grandes, hero
 * - heading    22/28  Space Grotesk SemiBold  — título de pantalla/sección
 * - subheading 17/22  Space Grotesk SemiBold  — título de card, sheet header
 * - body       15/22  Inter Regular           — texto de lectura
 * - bodyStrong 15/22  Inter Medium            — botones, énfasis
 * - label      13/18  Inter Medium            — labels de formularios/listas
 * - eyebrow    10/14  Inter Bold    — kicker con tracking amplio
 * - caption    12/16  Inter Regular           — metadatos, notas al pie
 */
// En native el peso viene codificado en el archivo de fuente
// (SpaceGrotesk_700Bold, Inter_500Medium…); poner fontWeight ahí puede forzar
// un fallback de familia en Android. En web la familia es genérica ("Inter"),
// así que el peso sí debe declararse.
const webWeight = (weight: TextStyle["fontWeight"]): TextStyle =>
  Platform.OS === "web" ? { fontWeight: weight } : {};

const VARIANT_STYLES: Record<AppTextVariant, TextStyle> = {
  display: {
    fontFamily: AppFonts.display,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
    ...webWeight("700"),
  },
  heading: {
    fontFamily: AppFonts.heading,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
    ...webWeight("600"),
  },
  subheading: {
    fontFamily: AppFonts.heading,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
    ...webWeight("600"),
  },
  body: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    lineHeight: 22,
    ...webWeight("400"),
  },
  bodyStrong: {
    fontFamily: AppFonts.bodyStrong,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.2,
    ...webWeight("500"),
  },
  label: {
    fontFamily: AppFonts.bodyStrong,
    fontSize: 13,
    lineHeight: 18,
    ...webWeight("500"),
  },
  eyebrow: {
    fontFamily: AppFonts.bodyStrong,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.6,
    ...webWeight("700"),
  },
  caption: {
    fontFamily: AppFonts.body,
    fontSize: 12,
    lineHeight: 16,
    ...webWeight("400"),
  },
};

// Color por defecto según el rol: los títulos y el cuerpo usan el tono
// principal; label/eyebrow bajan a secondary/label (AA garantizado) y
// caption queda en muted porque es decorativo.
const VARIANT_COLOR: Record<AppTextVariant, keyof ThemeColors> = {
  display: "textPrimary",
  heading: "textPrimary",
  subheading: "textPrimary",
  body: "textPrimary",
  bodyStrong: "textPrimary",
  label: "textSecondary",
  eyebrow: "textLabel",
  caption: "textMuted",
};

function AppText({ variant = "body", color, style, children, ...textProps }: AppTextProps) {
  const { colors } = useThemeColors();
  const resolvedColor = color ?? colors[VARIANT_COLOR[variant]];

  return (
    <Text {...textProps} style={[VARIANT_STYLES[variant], { color: resolvedColor }, style]}>
      {children}
    </Text>
  );
}

export default React.memo(AppText);
