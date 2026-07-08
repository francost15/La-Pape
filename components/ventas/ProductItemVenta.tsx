import type { ProductItemVentaProps } from "@/interface/ventas";
import { useCartProductActions } from "@/hooks/use-cart-product-actions";
import { useResponsive } from "@/hooks/use-responsive";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatCurrency } from "@/lib/utils/format";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "../ui/icon-symbol";
import QuantityStepper from "./QuantityStepper";

/**
 * ProductItemVenta — Digital Atelier style.
 *
 * Row-based list item. Uses View as the outer container to avoid nested
 * <button> hydration errors on web. Only the explicit add button or
 * quantity stepper is interactive.
 */
export default React.memo(function ProductItemVenta({
  product,
  compact = false,
  onProductAdded,
}: ProductItemVentaProps) {
  const { isDesktop } = useResponsive();
  const { isDark, colors } = useThemeColors();
  const [imageError, setImageError] = useState(false);
  const { quantity, inCart, handleAdd, handlePlus, handleMinus } = useCartProductActions(product, {
    onProductAdded,
  });

  const hasImage = product.imagen?.trim();
  const imgSize = isDesktop ? 56 : 48;
  const btnSize = isDesktop ? 38 : 36;

  return (
    <View
      // @ts-ignore cursor is web-only
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: isDesktop ? 16 : 12,
        paddingHorizontal: isDesktop ? 40 : 16,
        gap: isDesktop ? 20 : 12,
        backgroundColor: "transparent",
        ...(Platform.OS === "web" ? { cursor: inCart ? "default" : "pointer" } : {}),
      }}
      // @ts-ignore web only onClick
      onClick={Platform.OS === "web" && !inCart ? handleAdd : undefined}
      accessibilityLabel={product.nombre}
    >
      {/* ── Imagen ────────────────────────────────────────────── */}
      <View
        style={{
          width: imgSize,
          height: imgSize,
          borderRadius: 14,
          backgroundColor: isDark ? AppColors.dark.surfaceElevated : AppColors.light.surfaceHover,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {hasImage && !imageError ? (
          <Image
            source={{ uri: product.imagen }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <IconSymbol
              name="photo.fill"
              size={isDesktop ? 20 : 18}
              color={isDark ? "#48484A" : "#D1D1D6"}
            />
          </View>
        )}
      </View>

      {/* ── Texto ─────────────────────────────────────────────── */}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text
          style={{
            fontSize: isDesktop ? 15 : 14,
            fontWeight: "700",
            color: colors.textPrimary,
            fontFamily: AppFonts.bodyStrong,
          }}
          numberOfLines={1}
        >
          {product.nombre}
        </Text>
        <Text
          style={{
            fontSize: isDesktop ? 18 : 16,
            color: AppColors.primary,
            fontFamily: AppFonts.display,
            letterSpacing: -0.5,
          }}
        >
          {formatCurrency(product.precio_venta)}
        </Text>
      </View>

      {/* ── Acción ────────────────────────────────────────────── */}
      <View style={{ flexShrink: 0 }}>
        {inCart ? (
          <QuantityStepper
            quantity={quantity}
            onMinus={handleMinus}
            onPlus={handlePlus}
            size={btnSize - 4}
          />
        ) : (
          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.8}
            style={{
              width: btnSize,
              height: btnSize,
              borderRadius: btnSize / 2,
              backgroundColor: AppColors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel={`Agregar ${product.nombre}`}
          >
            <IconSymbol name="plus" size={btnSize * 0.5} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
