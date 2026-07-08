import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { CardProductDesktopProps } from "@/interface/products";
import { formatCurrency } from "@/lib/utils/format";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { ProductThumb } from "./ProductThumb";

export function CardProductDesktop({
  product,
  isDark,
  colors,
  hasImage,
  imageError,
  onImageError,
  onPress,
  onPressIn,
}: CardProductDesktopProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPressIn={onPressIn}
      onPress={onPress}
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: isDark ? AppColors.dark.surface : "#FFFFFF",
        ...(Platform.OS === "web"
          ? {
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              transition: "box-shadow 0.2s ease, transform 0.2s ease",
            }
          : { elevation: 2 }),
      }}
    >
      <ProductThumb
        uri={product.imagen}
        hasImage={hasImage}
        imageError={imageError}
        onError={onImageError}
        iconSize={32}
        fallbackColor={isDark ? AppColors.dark.textMuted : "#D1D5DB"}
        className="h-44 w-full overflow-hidden"
        style={{
          backgroundColor: isDark ? AppColors.dark.surfaceElevated : AppColors.light.surfaceHover,
        }}
      />

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
                backgroundColor:
                  product.cantidad > 0 ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
              }}
            >
              <Text
                className="text-[11px] font-semibold"
                style={{ color: product.cantidad > 0 ? AppColors.success : AppColors.error }}
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
            style={{
              color: isDark ? AppColors.primaryLight : AppColors.primary,
              fontFamily: AppFonts.display,
            }}
          >
            {formatCurrency(product.precio_venta)}
          </Text>
          <Text className="text-[12px]" style={{ color: colors.textLabel }}>
            Mayoreo: {formatCurrency(product.precio_mayoreo)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
