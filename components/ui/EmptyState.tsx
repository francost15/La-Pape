import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { Text, View } from "react-native";

type EmptyStateIcon = "cart" | "clock" | "search" | "products" | "error";

interface EmptyStateProps {
  icon: EmptyStateIcon;
  title: string;
  description?: string;
  iconColor?: string;
  className?: string;
}

const ICON_MAP: Record<EmptyStateIcon, string> = {
  cart: "cart.fill",
  clock: "clock.fill",
  search: "magnifyingglass",
  products: "bag.fill",
  error: "exclamationmark.triangle.fill",
};

export default function EmptyState({
  icon,
  title,
  description,
  iconColor = "#ea580c",
  className = "",
}: EmptyStateProps) {
  return (
    <View className={`items-center py-8 ${className}`}>
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <IconSymbol name={ICON_MAP[icon] as any} size={48} color={iconColor} />
      </View>
      <Text className="mt-3 text-center text-base font-bold text-gray-900 dark:text-gray-50">
        {title}
      </Text>
      {description ? (
        <Text className="mt-1.5 text-center text-sm text-gray-500 dark:text-gray-400">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
