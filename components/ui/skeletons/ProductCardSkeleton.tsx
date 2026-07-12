import { useThemeColors } from "@/hooks/use-theme-colors";
import React from "react";
import { View } from "react-native";
import { Bone } from "./Bone";

interface ProductCardSkeletonProps {
  /** "row" espeja CardProductCompact (mobile); "card" espeja CardProductDesktop (grid) */
  variant?: "row" | "card";
}

/**
 * ProductCardSkeleton — espeja las dimensiones reales de CardProducts para que
 * al llegar los datos no haya salto de layout: mismo thumb (64px), mismos
 * paddings (px-3 py-3.5) y misma altura de imagen en desktop (h-44).
 */
export function ProductCardSkeleton({ variant = "row" }: ProductCardSkeletonProps) {
  const { isDark, colors } = useThemeColors();

  if (variant === "card") {
    return (
      <View
        className="overflow-hidden rounded-xl"
        style={{ backgroundColor: isDark ? colors.surface : "#FFFFFF" }}
      >
        <Bone width="100%" height={176} borderRadius={0} />
        <View className="gap-2 p-3.5">
          <View className="flex-row items-center justify-between gap-2">
            <Bone width={64} height={12} />
            <Bone width={72} height={18} borderRadius={8} />
          </View>
          <Bone width="80%" height={14} />
          <Bone width={90} height={16} />
        </View>
      </View>
    );
  }

  return (
    <View
      className="w-full flex-row items-center gap-3 px-3 py-3.5"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <Bone width={64} height={64} borderRadius={10} />
      <View className="min-w-0 flex-1 gap-2">
        <Bone width="70%" height={14} />
        <Bone width="40%" height={12} />
      </View>
      <View className="items-end gap-1.5">
        <Bone width={72} height={16} />
        <Bone width={48} height={11} />
      </View>
    </View>
  );
}

interface ProductListSkeletonProps {
  /** Columnas del grid (1 = lista mobile) — debe coincidir con el grid real */
  numColumns?: number;
  count?: number;
}

/**
 * Lista de N skeletons para la pestaña de productos. En desktop replica el
 * padding de celda (10px) del renderItem real; en mobile la lista plana.
 */
export function ProductListSkeleton({ numColumns = 1, count = 8 }: ProductListSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (numColumns <= 1) {
    return (
      <View>
        {items.map((i) => (
          <ProductCardSkeleton key={i} variant="row" />
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap">
      {items.map((i) => (
        <View key={i} style={{ width: `${100 / numColumns}%`, padding: 10 }}>
          <ProductCardSkeleton variant="card" />
        </View>
      ))}
    </View>
  );
}
