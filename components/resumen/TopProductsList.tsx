import EmptyState from "@/components/resumen/shared/EmptyState";
import SectionCard from "@/components/resumen/shared/SectionCard";
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
  showDivider: boolean;
}

/**
 * Fila de ranking: número de posición como indicador tipográfico limpio,
 * sin fondo ni decoración. El número se alinea en monospace para escaneado vertical.
 */
const RankingRow = React.memo(function RankingRow({ item, rank, showDivider }: RankingRowProps) {
  const [imgError, setImgError] = useState(false);
  const hasImg = Boolean(item.producto.imagen?.trim()) && !imgError;

  const handlePress = () =>
    router.push({
      pathname: "/productos/producto/[id]" as never,
      params: { id: item.producto.id, product: JSON.stringify(item.producto) },
    });

  return (
    <Pressable onPress={handlePress} className="active:opacity-60">
      <View
        className={`flex-row items-center gap-3 py-2.5 ${
          showDivider ? "border-b border-gray-100 dark:border-neutral-700/60" : ""
        }`}
      >
        {/* Número de posición: monospace, acento solo en el #1 */}
        <Text
          className="w-4 text-center text-[12px] font-bold tabular-nums"
          style={{ color: rank === 1 ? "#ea580c" : "#d1d5db" }}
        >
          {rank}
        </Text>

        {/* Imagen miniatura cuadrada */}
        <View className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-700">
          {hasImg ? (
            <Image
              source={{ uri: item.producto.imagen }}
              style={{ width: 36, height: 36 }}
              contentFit="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <View className="h-4 w-4 rounded bg-gray-200 dark:bg-neutral-600" />
            </View>
          )}
        </View>

        {/* Nombre + marca */}
        <View className="min-w-0 flex-1">
          <Text
            className="text-[13px] leading-5 font-semibold text-gray-800 dark:text-gray-200"
            numberOfLines={1}
          >
            {item.producto.nombre}
          </Text>
          {item.producto.marca ? (
            <Text className="text-[10px] text-gray-400 dark:text-gray-500" numberOfLines={1}>
              {item.producto.marca}
            </Text>
          ) : null}
        </View>

        {/* Unidades + total */}
        <View className="shrink-0 items-end">
          <Text className="text-[13px] font-bold text-gray-900 tabular-nums dark:text-white">
            {formatCurrency(item.total)}
          </Text>
          <Text className="text-[10px] text-gray-400 tabular-nums dark:text-gray-500">
            {item.cantidad} {pluralize(item.cantidad, "ud.", "uds.")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

// ─── Componente principal ─────────────────────────────────────────────────────

interface TopProductsListProps {
  title: string;
  items: ProductoRanking[];
}

export default function TopProductsList({ title, items }: TopProductsListProps) {
  return (
    <SectionCard title={title} className="min-w-0 flex-1">
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
