import EmptyState from "@/components/resumen/shared/EmptyState";
import SectionCard from "@/components/resumen/shared/SectionCard";
import type { Product } from "@/interface";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

// ─── Row de stock ─────────────────────────────────────────────────────────────

interface StockRowProps {
  product: Product;
  showDivider: boolean;
}

/**
 * Fila con indicador de stock como pill badge compacto.
 * - Rojo sin fondo: stock crítico (cantidad = 0)
 * - Naranja: stock bajo pero existente
 */
const StockRow = React.memo(function StockRow({ product, showDivider }: StockRowProps) {
  const [imgError, setImgError] = useState(false);
  const hasImg = Boolean(product.imagen?.trim()) && !imgError;
  const stockMinimo = product.stock_minimo ?? 0;
  const isCritical = product.cantidad === 0;

  const handlePress = () =>
    router.push({
      pathname: "/productos/producto/[id]" as never,
      params: { id: product.id, product: JSON.stringify(product) },
    });

  return (
    <Pressable onPress={handlePress} className="active:opacity-60">
      <View
        className={`flex-row items-center gap-3 py-2.5 ${
          showDivider ? "border-b" : ""
        }`}
        style={showDivider ? { borderBottomColor: "rgba(0,0,0,0.04)" } : undefined}
      >
        {/* Imagen miniatura */}
        <View className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[#F5F5F4] dark:bg-[#1A1F2B]">
          {hasImg ? (
            <Image
              source={{ uri: product.imagen }}
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

        {/* Nombre + marca */}
        <View className="min-w-0 flex-1">
          <Text
            className="text-[13px] leading-5 font-semibold text-[#1A1A1A] dark:text-[#F0F0F0]"
            numberOfLines={1}
          >
            {product.nombre}
          </Text>
          {product.marca ? (
            <Text className="text-[10px] text-[#9CA3AF] dark:text-[#5A6478]" numberOfLines={1}>
              {product.marca}
            </Text>
          ) : null}
        </View>

        {/* Badge de stock */}
        <View
          className="shrink-0 rounded-md px-2 py-0.5"
          style={{
            backgroundColor: isCritical ? "#fee2e2" : "#fff7ed",
          }}
        >
          <Text
            className="text-[11px] font-bold tabular-nums"
            style={{ color: isCritical ? "#dc2626" : "#ea580c" }}
          >
            {isCritical ? "Sin stock" : `${product.cantidad} disp.`}
          </Text>
          {stockMinimo > 0 && !isCritical ? (
            <Text className="text-center text-[9px]" style={{ color: "#f97316" }}>
              mín. {stockMinimo}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

// ─── Componente principal ─────────────────────────────────────────────────────

interface ProductosBajoStockListProps {
  items: Product[];
}

export default function ProductosBajoStockList({ items }: ProductosBajoStockListProps) {
  return (
    <SectionCard title="Necesitan stock" className="min-w-0 flex-1">
      {items.length === 0 ? (
        <EmptyState
          message="Ningún producto requiere reabastecimiento"
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
