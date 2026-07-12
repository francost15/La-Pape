import { ResumenRow } from "@/components/resumen/shared/ResumenRow";
import { ResumenThumb } from "@/components/resumen/shared/ResumenThumb";
import SectionCard from "@/components/resumen/shared/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import { AppColors } from "@/constants/colors";
import { goToProductDetail } from "@/lib/navigation/go-to-product";
import type { ProductosBajoStockListProps, StockRowProps } from "@/interface/resumen";
import React from "react";
import { Text, View } from "react-native";

// ─── Row de stock ─────────────────────────────────────────────────────────────

/**
 * Fila con indicador de stock como pill badge compacto.
 * - Rojo sin fondo: stock crítico (cantidad = 0)
 * - Naranja: stock bajo pero existente
 */
const StockRow = React.memo(function StockRow({ product, showDivider }: StockRowProps) {
  const stockMinimo = product.stock_minimo ?? 0;
  const isCritical = product.cantidad === 0;

  return (
    <ResumenRow
      leading={<ResumenThumb uri={product.imagen} />}
      title={product.nombre}
      subtitle={product.marca}
      showDivider={showDivider}
      onPress={() => goToProductDetail(product)}
      trailing={
        <View
          className="shrink-0 rounded-md px-2 py-0.5"
          style={{ backgroundColor: isCritical ? "#fee2e2" : "#fff7ed" }}
        >
          <Text
            className="text-[11px] font-bold tabular-nums"
            style={{ color: isCritical ? AppColors.error : AppColors.primary }}
          >
            {isCritical ? "Sin stock" : `${product.cantidad} disp.`}
          </Text>
          {stockMinimo > 0 && !isCritical ? (
            <Text className="text-center text-[9px]" style={{ color: AppColors.primaryLight }}>
              mín. {stockMinimo}
            </Text>
          ) : null}
        </View>
      }
    />
  );
});

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProductosBajoStockList({ items }: ProductosBajoStockListProps) {
  return (
    <SectionCard title="Necesitan stock" className="min-w-0 flex-1">
      {items.length === 0 ? (
        <EmptyState
          title="Ningún producto requiere reabastecimiento"
          iconName="checkmark.circle.fill"
        />
      ) : (
        <View>
          {items.map((product, index) => (
            <StockRow key={product.id} product={product} showDivider={index < items.length - 1} />
          ))}
        </View>
      )}
    </SectionCard>
  );
}
