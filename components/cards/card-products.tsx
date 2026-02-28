import { CardProductsProps } from "@/interface/products";
import { useLayoutStore } from "@/store/layout-store";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CardProducts({
  product,
  className = "",
  variant = "default",
  rankingData,
  rank,
  stockData,
}: CardProductsProps) {
  const isMobile = useLayoutStore((s) => s.isMobile);
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    router.push({
      pathname: "/productos/producto/[id]" as never,
      params: {
        id: product.id,
        product: JSON.stringify(product),
      },
    });
  };

  const hasImage = Boolean(product.imagen?.trim());

  const handleCardPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handlePress();
  };

  const isRanking = variant === "ranking" && rankingData;
  const isStock = variant === "stock";
  const stockCantidad = stockData?.cantidad ?? product.cantidad;
  const stockMinimo = stockData?.stockMinimo ?? (product.stock_minimo ?? 0);
  const imgSize = 56;

  const ProductImage = () => (
    <View
      className="overflow-hidden rounded-[10px] bg-gray-200 dark:bg-neutral-700"
      style={{ height: imgSize, width: imgSize }}
    >
      {hasImage && !imageError ? (
        <Image
          source={{ uri: product.imagen }}
          resizeMode="cover"
          className="h-full w-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <IconSymbol name="photo.fill" size={22} color="#9ca3af" />
        </View>
      )}
    </View>
  );

  const StockRightContent = () => (
    <View className="items-end gap-0.5">
      <Text className="text-[13px] text-gray-500 dark:text-gray-400 tabular-nums">
        {stockMinimo > 0 ? `mín. ${stockMinimo}` : "mín. 0"}
      </Text>
      <Text
        className={`text-[17px] font-bold tabular-nums ${
          stockCantidad === 0
            ? "text-red-600 dark:text-red-400"
            : "text-orange-600 dark:text-orange-400"
        }`}
      >
        {stockCantidad} disp.
      </Text>
    </View>
  );

  const StockMiddleContent = () => (
    <View className="min-w-0 flex-1 gap-0.5">
      <Text
        className="text-[15px] font-semibold leading-5 text-gray-900 dark:text-white"
        numberOfLines={2}
      >
        {product.nombre}
      </Text>
      {product.marca ? (
        <Text className="text-[13px] text-gray-500 dark:text-gray-400">
          {product.marca}
        </Text>
      ) : null}
    </View>
  );

  const RankingRightContent = () =>
    isRanking ? (
      <View className="items-end gap-0.5">
        <Text className="text-[13px] text-gray-500 dark:text-gray-400 tabular-nums">
          {rankingData.cantidad} ud.
        </Text>
        <Text className="text-[17px] font-bold text-orange-600 tabular-nums">
          {formatCurrency(rankingData.total)}
        </Text>
      </View>
    ) : (
      <View className="items-end gap-0.5">
        <Text className="text-[17px] font-bold text-orange-600">
          ${product.precio_venta.toLocaleString()}
        </Text>
        {product.precio_mayoreo > 0 && (
          <Text className="text-[12px] text-gray-500 dark:text-gray-400">
            May: ${product.precio_mayoreo.toLocaleString()}
          </Text>
        )}
      </View>
    );

  const RankingMiddleContent = () =>
    isRanking ? (
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className="text-[15px] font-semibold leading-5 text-gray-900 dark:text-white"
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        {product.marca ? (
          <Text className="text-[13px] text-gray-500 dark:text-gray-400">
            {product.marca}
          </Text>
        ) : null}
      </View>
    ) : (
      <View className="min-w-0 flex-1 gap-1">
        <Text
          className="text-[15px] font-semibold leading-5 text-gray-900 dark:text-white"
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-[13px] text-gray-500 dark:text-gray-400">
            {product.marca || "Genérico"}
          </Text>
          {product.cantidad !== undefined && (
            <Text
              className={`text-[12px] font-medium ${
                product.cantidad > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {product.cantidad > 0 ? `${product.cantidad} disp.` : "Sin stock"}
            </Text>
          )}
        </View>
      </View>
    );

  if (isMobile || isRanking || isStock) {
    if (isStock) {
      return (
        <View className="rounded-xl bg-gray-50 dark:bg-neutral-700/50 border border-gray-100/80 dark:border-neutral-600 overflow-hidden">
          <View
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 12, paddingHorizontal: 10 }}
          >
            <ProductImage />
            <StockMiddleContent />
            <StockRightContent />
          </View>
        </View>
      );
    }
    if (isRanking) {
      return (
        <View className="rounded-xl bg-gray-50 dark:bg-neutral-700/50 border border-gray-100/80 dark:border-neutral-600 overflow-hidden">
          <Pressable
            onPress={handleCardPress}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 12, paddingHorizontal: 10 }}
            android_ripple={{ color: "rgba(0,0,0,0.05)" }}
          >
            {rank != null && (
              <View className="w-6 h-6 rounded-md bg-orange-600 items-center justify-center">
                <Text className="text-white text-[11px] font-bold">{rank}</Text>
              </View>
            )}
            <ProductImage />
            <RankingMiddleContent />
            <RankingRightContent />
          </Pressable>
        </View>
      );
    }
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleCardPress}
        className="w-full flex-row items-center gap-3 border-b border-gray-200 py-3.5 px-2 dark:border-neutral-800"
      >
        <View className="h-[68px] w-[68px] overflow-hidden rounded-[10px] bg-gray-200 dark:bg-neutral-700">
          {hasImage && !imageError ? (
            <Image
              source={{ uri: product.imagen }}
              resizeMode="cover"
              className="h-full w-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text className="text-xs text-gray-400">IMG</Text>
            </View>
          )}
        </View>

        <View className="min-w-0 flex-1 gap-1">
          <Text
            className="text-[15px] font-semibold leading-5 text-gray-900 dark:text-white"
            numberOfLines={2}
          >
            {product.nombre}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-[13px] text-gray-500 dark:text-gray-400">
              {product.marca || "Genérico"}
            </Text>
            {product.cantidad !== undefined && (
              <Text
                className={`text-[12px] font-medium ${
                  product.cantidad > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {product.cantidad > 0 ? `${product.cantidad} disp.` : "Sin stock"}
              </Text>
            )}
          </View>
        </View>

        <View className="items-end gap-0.5">
          <Text className="text-[17px] font-bold text-orange-600">
            ${product.precio_venta.toLocaleString()}
          </Text>
          {product.precio_mayoreo > 0 && (
            <Text className="text-[12px] text-gray-500 dark:text-gray-400">
              May: ${product.precio_mayoreo.toLocaleString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPressIn={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }}
      onPress={handlePress}
      className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-neutral-800"
    >
      <View className="h-48 w-full overflow-hidden bg-gray-200 dark:bg-neutral-700">
        {hasImage && !imageError ? (
          <Image
            source={{ uri: product.imagen }}
            resizeMode="cover"
            className="h-full w-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-200 dark:bg-neutral-700">
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {imageError ? "Error al cargar" : "Sin imagen"}
            </Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <View className="mb-1.5 flex-row items-center justify-between gap-2">
          {product.marca && (
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {product.marca}
            </Text>
          )}
          {product.cantidad !== undefined && (
            <View
              className={`rounded-lg px-2.5 py-1 ${
                product.cantidad > 0
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  product.cantidad > 0
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {product.cantidad > 0 ? `Stock: ${product.cantidad}` : "Sin stock"}
              </Text>
            </View>
          )}
        </View>
        <Text
          className="mb-2 text-base font-semibold text-gray-900 dark:text-white"
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        <View className="flex-row items-baseline gap-2">
          <Text className="text-lg font-bold text-orange-600">
            ${product.precio_venta.toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Mayoreo: ${product.precio_mayoreo.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
