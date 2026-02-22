import { CardProductsProps } from "@/interface/products";
import { useLayoutStore } from "@/store/layout-store";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CardProducts({ product, className = "" }: CardProductsProps) {
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

  if (isMobile) {
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
