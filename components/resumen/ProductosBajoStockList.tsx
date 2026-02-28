import EmptyState from "@/components/resumen/shared/EmptyState";
import SectionCard from "@/components/resumen/shared/SectionCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
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
 * Fila de lista plana para productos con stock bajo.
 * Muestra el stock actual vs el mínimo configurado con color semafórico:
 * - Rojo: sin stock (cantidad = 0)
 * - Naranja: stock bajo pero existente
 * NO usar CardProducts — esa card genérica no encaja en el contexto del resumen.
 */
function StockRow({ product, showDivider }: StockRowProps) {
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
    <Pressable onPress={handlePress} className="active:opacity-70">
      <View
        className={`flex-row items-center gap-3 py-2.5 ${
          showDivider ? "border-b border-gray-100 dark:border-neutral-700" : ""
        }`}
      >
        {/* Imagen miniatura */}
        <View className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-700 shrink-0">
          {hasImg ? (
            <Image
              source={{ uri: product.imagen }}
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
            {product.nombre}
          </Text>
          {product.marca ? (
            <Text className="text-[11px] text-gray-400 dark:text-gray-500" numberOfLines={1}>
              {product.marca}
            </Text>
          ) : null}
        </View>

        {/* Stock actual vs mínimo */}
        <View className="items-end shrink-0">
          <Text
            className={`text-[13px] font-bold tabular-nums ${
              isCritical
                ? "text-red-500 dark:text-red-400"
                : "text-orange-500 dark:text-orange-400"
            }`}
          >
            {product.cantidad} disp.
          </Text>
          {stockMinimo > 0 ? (
            <Text className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
              mín. {stockMinimo}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface ProductosBajoStockListProps {
  items: Product[];
}

/**
 * Lista de productos con stock igual o menor al mínimo configurado.
 * Ordenados de menor a mayor cantidad disponible (críticos primero).
 */
export default function ProductosBajoStockList({ items }: ProductosBajoStockListProps) {
  return (
    <SectionCard title="Productos que necesitan stock" className="flex-1 min-w-0">
      {items.length === 0 ? (
        <EmptyState
          message="Ningún producto requiere reabastecimiento"
          iconName="checkmark.circle.fill"
        />
      ) : (
        <View>
          {items.map((product, index) => (
            <StockRow
              key={product.id}
              product={product}
              showDivider={index < items.length - 1}
            />
          ))}
        </View>
      )}
    </SectionCard>
  );
}
