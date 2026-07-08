import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { AppFonts } from "@/constants/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Text, View } from "react-native";
import type { EmptyStateIcon, EmptyStateProps } from "@/interface/ui";

const ICON_MAP: Record<EmptyStateIcon, string> = {
  cart: "cart.fill",
  clock: "clock.fill",
  search: "magnifyingglass",
  products: "bag.fill",
  error: "exclamationmark.triangle.fill",
};

/**
 * EmptyState — Digital Atelier style.
 *
 * Acepta un ícono predefinido (`icon`) o un SF Symbol arbitrario (`iconName`).
 * Unifica el componente duplicado que antes existía en resumen/shared/EmptyState.
 */
export default function EmptyState({
  icon,
  iconName,
  title,
  description,
  iconColor,
}: EmptyStateProps) {
  const { colors } = useThemeColors();

  const resolvedIconColor = iconColor ?? colors.textMuted;
  const resolvedIconName = icon ? ICON_MAP[icon] : iconName;

  return (
    <View style={{ alignItems: "center", paddingVertical: 32 }}>
      {resolvedIconName && (
        <View
          style={{
            height: 64,
            width: 64,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            backgroundColor: `${resolvedIconColor}15`,
            marginBottom: 16,
          }}
        >
          <IconSymbol name={resolvedIconName as any} size={32} color={resolvedIconColor} />
        </View>
      )}
      <Text
        style={{
          textAlign: "center",
          fontSize: 18,
          fontWeight: "800",
          color: colors.textPrimary,
          fontFamily: AppFonts.heading,
          letterSpacing: -0.4,
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            marginTop: 6,
            textAlign: "center",
            fontSize: 15,
            color: colors.textSecondary,
            fontFamily: AppFonts.body,
          }}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}
