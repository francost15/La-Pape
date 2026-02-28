import EmptyState from "@/components/resumen/shared/EmptyState";
import SectionCard from "@/components/resumen/shared/SectionCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency, pluralize } from "@/lib/utils/format";
import type { ProductoRanking } from "@/store/resumen-store";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

// ─── Row de ranking ───────────────────────────────────────────────────────────

interface RankingRowProps {
  item: ProductoRanking;
  rank: number;
  /** true si NO es el último ítem — muestra separador inferior */
  showDivider: boolean;
}

/**
 * Fila de lista plana para el ranking de productos.
 * Diseño tipo "tabla": sin card por fila, separador sutil entre items.
 * NO usar CardProducts aquí — esa card genérica queda fuera de lugar en el resumen.
 */
function RankingRow({ item, rank, showDivider }: RankingRowProps) {
  const [imgError, setImgError] = useState(false);
  const hasImg = Boolean(item.producto.imagen?.trim()) && !imgError;

  const handlePress = () =>
    router.push({
      pathname: "/productos/producto/[id]" as never,
      params: { id: item.producto.id, product: JSON.stringify(item.producto) },
    });

  return (
    <Pressable
      onPress={handlePress}
      className="active:opacity-70"
    >
      <View
        className={`flex-row items-center gap-3 py-2.5 ${
          showDivider ? "border-b border-gray-100 dark:border-neutral-700" : ""
        }`}
      >
        {/* Número de posición */}
        <Text className="text-[13px] font-bold text-orange-500 tabular-nums w-5 text-center">
          {rank}
        </Text>

        {/* Imagen miniatura cuadrada */}
        <View className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-700 shrink-0">
          {hasImg ? (
            <Image
              source={{ uri: item.producto.imagen }}
              style={{ width: 40, height: 40 }}
              contentFit="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <IconSymbol name="photo.fill" size={16} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Nombre + marca */}
        <View className="flex-1 min-w-0">
          <Text
            className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 leading-5"
            numberOfLines={1}
          >
            {item.producto.nombre}
          </Text>
          {item.producto.marca ? (
            <Text className="text-[11px] text-gray-400 dark:text-gray-500" numberOfLines={1}>
              {item.producto.marca}
            </Text>
          ) : null}
        </View>

        {/* Unidades + total */}
        <View className="items-end shrink-0">
          <Text className="text-[13px] font-bold text-gray-900 dark:text-white tabular-nums">
            {formatCurrency(item.total)}
          </Text>
          <Text className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
            {item.cantidad} {pluralize(item.cantidad, "ud.", "uds.")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface TopProductsListProps {
  title: string;
  items: ProductoRanking[];
}

export default function TopProductsList({ title, items }: TopProductsListProps) {
  return (
    <SectionCard title={title} className="flex-1 min-w-0">
      {items.length === 0 ? (
        <EmptyState message="Sin datos disponibles" iconName="chart.bar.fill" />
      ) : (
        <View>
          {items.map((item, index) => (
            <RankingRow
              key={item.producto.id}
              item={item}
              rank={index + 1}
              showDivider={index < items.length - 1}
            />
          ))}
        </View>
      )}
    </SectionCard>
  );
}
