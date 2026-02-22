import type { ProductoRanking } from "@/store/resumen-store";
import React from "react";
import { Platform, Text, View } from "react-native";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface TopProductsListProps {
  title: string;
  items: ProductoRanking[];
  variant: "top" | "bottom";
}

export default function TopProductsList({ title, items, variant }: TopProductsListProps) {
  const badgeColor =
    variant === "top"
      ? "bg-orange-600"
      : "bg-gray-400 dark:bg-gray-500";

  const totalColor =
    variant === "top"
      ? "text-orange-600 dark:text-orange-400"
      : "text-gray-600 dark:text-gray-400";

  return (
    <View
      className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-gray-100 dark:border-neutral-700"
      style={
        Platform.OS === "web"
          ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
          : { elevation: 1 }
      }
    >
      <Text className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">
        {title}
      </Text>

      {items.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-sm text-gray-400 dark:text-gray-500">
            Sin datos disponibles
          </Text>
        </View>
      ) : (
        <View className="gap-2">
          {items.map((pv, index) => (
            <View
              key={pv.producto.id}
              className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-neutral-700/50"
            >
              <View
                className={`w-6 h-6 rounded-lg items-center justify-center ${badgeColor}`}
              >
                <Text className="text-white text-[11px] font-bold">
                  {index + 1}
                </Text>
              </View>

              <Text
                className="text-sm text-gray-800 dark:text-gray-200 font-medium flex-1"
                numberOfLines={1}
              >
                {pv.producto.nombre}
              </Text>

              <Text className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                {pv.cantidad} ud.
              </Text>

              <Text className={`text-sm font-semibold tabular-nums ${totalColor}`}>
                {formatCurrency(pv.total)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
