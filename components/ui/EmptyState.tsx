import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Text, View } from "react-native";

type EmptyStateIcon = "cart" | "clock" | "search" | "products" | "error";

interface EmptyStateProps {
  icon: EmptyStateIcon;
  title: string;
  description?: string;
  iconColor?: string;
}

const ICON_MAP: Record<EmptyStateIcon, string> = {
  cart: "cart.fill",
  clock: "clock.fill",
  search: "magnifyingglass",
  products: "bag.fill",
  error: "exclamationmark.triangle.fill",
};

/**
 * EmptyState — Digital Atelier style.
 */
export default function EmptyState({
  icon,
  title,
  description,
  iconColor = "#ea580c",
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? AppColors.dark : AppColors.light;

  return (
    <View style={{ alignItems: "center", paddingVertical: 48 }}>
      <View
        style={{
          height: 64,
          width: 64,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 20,
          backgroundColor: `${iconColor}15`,
          marginBottom: 16,
        }}
      >
        <IconSymbol name={ICON_MAP[icon] as any} size={32} color={iconColor} />
      </View>
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
