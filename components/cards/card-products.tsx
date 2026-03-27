import { CardProductsProps } from "@/interface/products";
import { formatCurrency } from "@/lib/utils/format";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLayoutStore } from "@/store/layout-store";
import * as Haptics from "expo-haptics";
import { useHaptic } from "@/hooks/use-haptic";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "../ui/icon-symbol";

/**
 * CardProducts — Digital Atelier style.
 * Desktop: clean card with hover elevation, no default border.
 * Mobile/ranking/stock: flat list items with subtle separators.
 */
export default React.memo(function CardProducts({
  product,
  className = "",
  variant = "default",
  rankingData,
  rank,
  stockData,
}: CardProductsProps) {
  const isMobile = useLayoutStore((s) => s.isMobile);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [imageError, setImageError] = useState(false);
  const haptic = useHaptic();
  const hapticMedium = useHaptic(Haptics.ImpactFeedbackStyle.Medium);

  const colors = isDark ? AppColors.dark : AppColors.light;

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
    haptic();
    handlePress();
  };

  const isRanking = variant === "ranking" && rankingData;
  const isStock = variant === "stock";
  const stockCantidad = stockData?.cantidad ?? product.cantidad;
  const stockMinimo = stockData?.stockMinimo ?? (product.stock_minimo ?? 0);
  const imgSize = 52;

  const ProductImage = () => (
    <View
      className="overflow-hidden rounded-[10px]"
      style={{
        height: imgSize,
        width: imgSize,
        backgroundColor: isDark ? AppColors.dark.surfaceElevated : "#F5F5F4",
      }}
    >
      {hasImage && !imageError ? (
        <Image
          source={{ uri: product.imagen }}
          contentFit="cover"
          className="h-full w-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <View className="h-full w-full items-center justify-center">
          <IconSymbol name="photo.fill" size={20} color={isDark ? "#5A6478" : "#C7C7CC"} />
        </View>
      )}
    </View>
  );

  const StockRightContent = () => (
    <View className="items-end gap-0.5">
      <Text
        className="text-[12px] tabular-nums"
        style={{ color: colors.textSecondary }}
      >
        {stockMinimo > 0 ? `mín. ${stockMinimo}` : "mín. 0"}
      </Text>
      <Text
        className={`text-[16px] font-bold tabular-nums ${
          stockCantidad === 0 ? "text-red-500" : ""
        }`}
        style={{ color: stockCantidad === 0 ? AppColors.error : isDark ? "#F97316" : "#ea580c" }}
      >
        {stockCantidad} disp.
      </Text>
    </View>
  );

  const StockMiddleContent = () => (
    <View className="min-w-0 flex-1 gap-0.5">
      <Text
        className="text-[14px] font-semibold leading-5"
        style={{ color: colors.textPrimary, fontFamily: AppFonts.bodyStrong }}
        numberOfLines={2}
      >
        {product.nombre}
      </Text>
      {product.marca ? (
        <Text className="text-[12px]" style={{ color: colors.textSecondary }}>
          {product.marca}
        </Text>
      ) : null}
    </View>
  );

  const RankingRightContent = () =>
    isRanking ? (
      <View className="items-end gap-0.5">
        <Text className="text-[12px] tabular-nums" style={{ color: colors.textSecondary }}>
          {rankingData.cantidad} ud.
        </Text>
        <Text
          className="text-[16px] font-bold tabular-nums"
          style={{ color: isDark ? "#F97316" : "#ea580c", fontFamily: AppFonts.display }}
        >
          {formatCurrency(rankingData.total)}
        </Text>
      </View>
    ) : (
      <View className="items-end gap-0.5">
        <Text
          className="text-[16px] font-bold"
          style={{ color: isDark ? "#F97316" : "#ea580c", fontFamily: AppFonts.display }}
        >
          ${product.precio_venta.toLocaleString()}
        </Text>
        {product.precio_mayoreo > 0 && (
          <Text className="text-[11px]" style={{ color: colors.textMuted }}>
            May: ${product.precio_mayoreo.toLocaleString()}
          </Text>
        )}
      </View>
    );

  const RankingMiddleContent = () =>
    isRanking ? (
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className="text-[14px] font-semibold leading-5"
          style={{ color: colors.textPrimary, fontFamily: AppFonts.bodyStrong }}
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        {product.marca ? (
          <Text className="text-[12px]" style={{ color: colors.textSecondary }}>
            {product.marca}
          </Text>
        ) : null}
      </View>
    ) : (
      <View className="min-w-0 flex-1 gap-1">
        <Text
          className="text-[14px] font-semibold leading-5"
          style={{ color: colors.textPrimary, fontFamily: AppFonts.bodyStrong }}
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        <View className="flex-row items-center gap-2">
          <Text className="text-[12px]" style={{ color: colors.textSecondary }}>
            {product.marca || "Genérico"}
          </Text>
          {product.cantidad !== undefined && (
            <Text
              className="text-[11px] font-medium"
              style={{
                color: product.cantidad > 0 ? AppColors.success : AppColors.error,
              }}
            >
              {product.cantidad > 0 ? `${product.cantidad} disp.` : "Sin stock"}
            </Text>
          )}
        </View>
      </View>
    );

  /* ── Compact list variants (mobile, ranking, stock) ────── */
  if (isMobile || isRanking || isStock) {
    if (isStock) {
      return (
        <View
          className="overflow-hidden rounded-xl"
          style={{
            backgroundColor: isDark ? AppColors.dark.surfaceElevated : "#F8F8F7",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 12, paddingHorizontal: 12 }}
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
        <View
          className="overflow-hidden rounded-xl"
          style={{
            backgroundColor: isDark ? AppColors.dark.surfaceElevated : "#F8F8F7",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Pressable
            onPress={handleCardPress}
            className="flex-row items-center gap-3"
            style={{ paddingVertical: 12, paddingHorizontal: 12 }}
            android_ripple={{ color: "rgba(0,0,0,0.05)" }}
          >
            {rank != null && (
              <View className="w-6 h-6 rounded-md items-center justify-center" style={{ backgroundColor: "#ea580c" }}>
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
    /* Default mobile list item */
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleCardPress}
        className="w-full flex-row items-center gap-3 py-3.5 px-3"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          className="overflow-hidden rounded-[10px]"
          style={{
            height: 64,
            width: 64,
            backgroundColor: isDark ? AppColors.dark.surfaceElevated : "#F5F5F4",
          }}
        >
          {hasImage && !imageError ? (
            <Image
              source={{ uri: product.imagen }}
              contentFit="cover"
              className="h-full w-full"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <IconSymbol name="photo.fill" size={22} color={isDark ? "#5A6478" : "#C7C7CC"} />
            </View>
          )}
        </View>

        <View className="min-w-0 flex-1 gap-1">
          <Text
            className="text-[14px] font-semibold leading-5"
            style={{ color: colors.textPrimary, fontFamily: AppFonts.bodyStrong }}
            numberOfLines={2}
          >
            {product.nombre}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-[12px]" style={{ color: colors.textSecondary }}>
              {product.marca || "Genérico"}
            </Text>
            {product.cantidad !== undefined && (
              <Text
                className="text-[11px] font-medium"
                style={{
                  color: product.cantidad > 0 ? AppColors.success : AppColors.error,
                }}
              >
                {product.cantidad > 0 ? `${product.cantidad} disp.` : "Sin stock"}
              </Text>
            )}
          </View>
        </View>

        <View className="items-end gap-0.5">
          <Text
            className="text-[16px] font-bold"
            style={{ color: isDark ? "#F97316" : "#ea580c", fontFamily: AppFonts.display }}
          >
            ${product.precio_venta.toLocaleString()}
          </Text>
          {product.precio_mayoreo > 0 && (
            <Text className="text-[11px]" style={{ color: colors.textMuted }}>
              May: ${product.precio_mayoreo.toLocaleString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  /* ── Desktop grid card ─────────────────────────────────── */
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPressIn={hapticMedium}
      onPress={handlePress}
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: isDark ? AppColors.dark.surface : "#FFFFFF",
        ...(Platform.OS === "web"
          ? { boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s ease, transform 0.2s ease" }
          : { elevation: 2 }),
      }}
    >
      <View
        className="h-44 w-full overflow-hidden"
        style={{ backgroundColor: isDark ? AppColors.dark.surfaceElevated : "#F5F5F4" }}
      >
        {hasImage && !imageError ? (
          <Image
            source={{ uri: product.imagen }}
            contentFit="cover"
            className="h-full w-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <IconSymbol name="photo.fill" size={32} color={isDark ? "#5A6478" : "#D1D5DB"} />
          </View>
        )}
      </View>

      <View className="p-3.5">
        <View className="mb-1.5 flex-row items-center justify-between gap-2">
          {product.marca && (
            <Text className="text-[12px] font-medium" style={{ color: colors.textSecondary }}>
              {product.marca}
            </Text>
          )}
          {product.cantidad !== undefined && (
            <View
              className="rounded-lg px-2 py-0.5"
              style={{
                backgroundColor: product.cantidad > 0
                  ? "rgba(22,163,74,0.08)"
                  : "rgba(220,38,38,0.08)",
              }}
            >
              <Text
                className="text-[11px] font-semibold"
                style={{
                  color: product.cantidad > 0 ? AppColors.success : AppColors.error,
                }}
              >
                {product.cantidad > 0 ? `Stock: ${product.cantidad}` : "Sin stock"}
              </Text>
            </View>
          )}
        </View>
        <Text
          className="mb-2 text-[15px] font-semibold"
          style={{ color: colors.textPrimary, fontFamily: AppFonts.bodyStrong }}
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        <View className="flex-row items-baseline gap-2">
          <Text
            className="text-[17px] font-bold"
            style={{ color: isDark ? "#F97316" : "#ea580c", fontFamily: AppFonts.display }}
          >
            ${product.precio_venta.toLocaleString()}
          </Text>
          <Text className="text-[12px]" style={{ color: colors.textMuted }}>
            Mayoreo: ${product.precio_mayoreo.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
