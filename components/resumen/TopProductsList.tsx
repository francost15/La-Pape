import EmptyState from "@/components/ui/EmptyState";
import SectionCard from "@/components/resumen/shared/SectionCard";
import { AppColors } from "@/constants/colors";
import { formatCurrency, pluralize } from "@/lib/utils/format";
import { goToProductDetail } from "@/lib/navigation/go-to-product";
import type { RankingRowProps, TopProductsListProps } from "@/interface/resumen";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

// ─── Row de ranking ───────────────────────────────────────────────────────────

/**
 * Fila de ranking: número de posición como indicador tipográfico limpio,
 * sin fondo ni decoración. El número se alinea en monospace para escaneado vertical.
 */
const RankingRow = React.memo(function RankingRow({ item, rank, showDivider }: RankingRowProps) {
  const [imgError, setImgError] = useState(false);
  const hasImg = Boolean(item.producto.imagen?.trim()) && !imgError;

  const handlePress = () => goToProductDetail(item.producto);

  return (
    <Pressable onPress={handlePress} className="active:opacity-60">
      <View
        className={`flex-row items-center gap-3 py-2.5 ${showDivider ? "border-b" : ""}`}
        style={showDivider ? { borderBottomColor: "rgba(0,0,0,0.04)" } : undefined}
      >
        <Text
          className="w-4 text-center text-[12px] font-bold tabular-nums"
          style={{ color: rank === 1 ? AppColors.primary : AppColors.light.textSecondary }}
        >
          {rank}
        </Text>

        <View className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F4] dark:bg-[#1A1F2B]">
          {hasImg ? (
            <Image
              source={{ uri: item.producto.imagen }}
              style={{ width: 36, height: 36 }}
              contentFit="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <View className="h-4 w-4 rounded bg-[#E5E7EB] dark:bg-[#2A3040]" />
            </View>
          )}
        </View>

        <View className="min-w-0 flex-1">
          <Text
            className="text-[13px] leading-5 font-semibold text-content-primary"
            numberOfLines={1}
          >
            {item.producto.nombre}
          </Text>
          {item.producto.marca ? (
            <Text className="text-[10px] text-content-secondary" numberOfLines={1}>
              {item.producto.marca}
            </Text>
          ) : null}
        </View>

        <View className="shrink-0 items-end">
          <Text className="text-[13px] font-bold text-content-primary tabular-nums">
            {formatCurrency(item.total)}
          </Text>
          <Text className="text-[10px] text-content-secondary tabular-nums">
            {item.cantidad} {pluralize(item.cantidad, "ud.", "uds.")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TopProductsList({ title, items }: TopProductsListProps) {
  return (
    <SectionCard title={title} className="min-w-0 flex-1">
      {items.length === 0 ? (
        <EmptyState title="Sin datos disponibles" iconName="chart.bar.fill" />
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
