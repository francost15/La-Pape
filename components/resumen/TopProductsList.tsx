import { ResumenRow } from "@/components/resumen/shared/ResumenRow";
import SectionCard from "@/components/resumen/shared/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { ResumenThumb } from "@/components/resumen/shared/ResumenThumb";
import { formatCurrency, pluralize } from "@/lib/utils/format";
import { goToProductDetail } from "@/lib/navigation/go-to-product";
import type { RankingRowProps, TopProductsListProps } from "@/interface/resumen";
import React from "react";
import { Text, View } from "react-native";

// ─── Row de ranking ───────────────────────────────────────────────────────────

/**
 * Fila de ranking: número de posición como indicador tipográfico limpio,
 * sin fondo ni decoración. El número se alinea en monospace para escaneado vertical.
 */
const RankingRow = React.memo(function RankingRow({ item, rank, showDivider }: RankingRowProps) {
  return (
    <ResumenRow
      rank={rank}
      leading={<ResumenThumb uri={item.producto.imagen} />}
      title={item.producto.nombre}
      subtitle={item.producto.marca}
      showDivider={showDivider}
      onPress={() => goToProductDetail(item.producto)}
      trailing={
        <View className="shrink-0 items-end">
          <Text className="text-[13px] font-bold text-content-primary tabular-nums">
            {formatCurrency(item.total)}
          </Text>
          <Text className="text-[10px] text-content-secondary tabular-nums">
            {item.cantidad} {pluralize(item.cantidad, "ud.", "uds.")}
          </Text>
        </View>
      }
    />
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
