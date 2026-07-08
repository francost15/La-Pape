import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { CardProductCompactProps } from "@/interface/products";
import { formatCurrency } from "@/lib/utils/format";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { ProductThumb } from "./ProductThumb";

export function CardProductCompact({
  mode,
  product,
  isDark,
  colors,
  hasImage,
  imageError,
  onImageError,
  onPress,
  rankingData,
  rank,
  stockData,
}: CardProductCompactProps) {
  const thumbBg = isDark ? AppColors.dark.surfaceElevated : AppColors.light.surfaceHover;
  const fallbackColor = isDark ? AppColors.dark.textMuted : "#C7C7CC";
  const cardBg = isDark ? AppColors.dark.surfaceElevated : "#F8F8F7";

  const thumb = (
    <ProductThumb
      uri={product.imagen}
      hasImage={hasImage}
      imageError={imageError}
      onError={onImageError}
      iconSize={mode === "mobile" ? 22 : 20}
      fallbackColor={fallbackColor}
      className="overflow-hidden rounded-[10px]"
      style={{
        height: mode === "mobile" ? 64 : 52,
        width: mode === "mobile" ? 64 : 52,
        backgroundColor: thumbBg,
      }}
    />
  );

  const nombre = (
    <Text
      className="text-[14px] leading-5 font-semibold"
      style={{ color: colors.textPrimary, fontFamily: AppFonts.bodyStrong }}
      numberOfLines={2}
    >
      {product.nombre}
    </Text>
  );

  if (mode === "stock") {
    const stockCantidad = stockData?.cantidad ?? product.cantidad;
    const stockMinimo = stockData?.stockMinimo ?? product.stock_minimo ?? 0;
    return (
      <View
        className="overflow-hidden rounded-xl"
        style={{ backgroundColor: cardBg, borderWidth: 1, borderColor: colors.border }}
      >
        <View
          className="flex-row items-center gap-3"
          style={{ paddingVertical: 12, paddingHorizontal: 12 }}
        >
          {thumb}
          <View className="min-w-0 flex-1 gap-0.5">
            {nombre}
            {product.marca ? (
              <Text className="text-[12px]" style={{ color: colors.textSecondary }}>
                {product.marca}
              </Text>
            ) : null}
          </View>
          <View className="items-end gap-0.5">
            <Text className="text-[12px] tabular-nums" style={{ color: colors.textSecondary }}>
              {stockMinimo > 0 ? `mín. ${stockMinimo}` : "mín. 0"}
            </Text>
            <Text
              className={`text-[16px] font-bold tabular-nums ${
                stockCantidad === 0 ? "text-red-500" : ""
              }`}
              style={{
                color:
                  stockCantidad === 0
                    ? AppColors.error
                    : isDark
                      ? AppColors.primaryLight
                      : AppColors.primary,
              }}
            >
              {stockCantidad} disp.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (mode === "ranking") {
    return (
      <View
        className="overflow-hidden rounded-xl"
        style={{ backgroundColor: cardBg, borderWidth: 1, borderColor: colors.border }}
      >
        <Pressable
          onPress={onPress}
          className="flex-row items-center gap-3"
          style={{ paddingVertical: 12, paddingHorizontal: 12 }}
          android_ripple={{ color: "rgba(0,0,0,0.05)" }}
        >
          {rank != null && (
            <View
              className="h-6 w-6 items-center justify-center rounded-md"
              style={{ backgroundColor: AppColors.primary }}
            >
              <Text className="text-[11px] font-bold text-white">{rank}</Text>
            </View>
          )}
          {thumb}
          <View className="min-w-0 flex-1 gap-0.5">
            {nombre}
            {product.marca ? (
              <Text className="text-[12px]" style={{ color: colors.textSecondary }}>
                {product.marca}
              </Text>
            ) : null}
          </View>
          <View className="items-end gap-0.5">
            <Text className="text-[12px] tabular-nums" style={{ color: colors.textSecondary }}>
              {rankingData?.cantidad} ud.
            </Text>
            <Text
              className="text-[16px] font-bold tabular-nums"
              style={{
                color: isDark ? AppColors.primaryLight : AppColors.primary,
                fontFamily: AppFonts.display,
              }}
            >
              {formatCurrency(rankingData?.total ?? 0)}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  // mode === "mobile"
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="w-full flex-row items-center gap-3 px-3 py-3.5"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      {thumb}
      <View className="min-w-0 flex-1 gap-1">
        {nombre}
        <View className="flex-row items-center gap-2">
          <Text className="text-[12px]" style={{ color: colors.textSecondary }}>
            {product.marca || "Genérico"}
          </Text>
          {product.cantidad !== undefined && (
            <Text
              className="text-[11px] font-medium"
              style={{ color: product.cantidad > 0 ? AppColors.success : AppColors.error }}
            >
              {product.cantidad > 0 ? `${product.cantidad} disp.` : "Sin stock"}
            </Text>
          )}
        </View>
      </View>
      <View className="items-end gap-0.5">
        <Text
          className="text-[16px] font-bold"
          style={{
            color: isDark ? AppColors.primaryLight : AppColors.primary,
            fontFamily: AppFonts.display,
          }}
        >
          {formatCurrency(product.precio_venta)}
        </Text>
        {product.precio_mayoreo > 0 && (
          <Text className="text-[11px]" style={{ color: colors.textLabel }}>
            May: {formatCurrency(product.precio_mayoreo)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
