import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { ProductCardMobileProps } from "@/interface/ventas";
import { useCartProductActions } from "@/hooks/use-cart-product-actions";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatCurrency } from "@/lib/utils/format";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { IconSymbol } from "../ui/icon-symbol";
import QuantityStepper from "./QuantityStepper";

const IMG_SIZE = 48;

/**
 * ProductCardMobile — Digital Atelier style.
 * Fila con separador sutil. Sin botones anidados.
 */
export default React.memo(function ProductCardMobile({
  product,
  onProductAdded,
}: ProductCardMobileProps) {
  const { isDark, colors } = useThemeColors();
  const [imageError, setImageError] = useState(false);
  const { quantity, inCart, handleAdd, handlePlus, handleMinus } = useCartProductActions(product, {
    onProductAdded,
  });

  const hasImage = product.imagen?.trim();

  return (
    <View
      // @ts-ignore cursor is web-only
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 12,
        ...(Platform.OS === "web" ? { cursor: inCart ? "default" : "pointer" } : {}),
      }}
      // @ts-ignore web only onClick
      onClick={Platform.OS === "web" && !inCart ? handleAdd : undefined}
      accessibilityLabel={product.nombre}
    >
      {/* Imagen */}
      <View
        style={{
          width: IMG_SIZE,
          height: IMG_SIZE,
          borderRadius: 10,
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
              size={20}
              color={isDark ? AppColors.dark.textMuted : "#C7C7CC"}
            />
          </View>
        )}
      </View>

      {/* Texto */}
      <View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.textPrimary,
            letterSpacing: -0.2,
            fontFamily: AppFonts.bodyStrong,
          }}
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        {product.marca ? (
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              fontWeight: "500",
              fontFamily: AppFonts.body,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {product.marca}
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: AppColors.primary,
            letterSpacing: -0.3,
            fontFamily: AppFonts.display,
            marginTop: 3,
          }}
        >
          {formatCurrency(product.precio_venta)}
        </Text>
      </View>

      {/* Acción */}
      <View style={{ alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {inCart ? (
          <QuantityStepper
            quantity={quantity}
            onMinus={handleMinus}
            onPlus={handlePlus}
            size={32}
          />
        ) : (
          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.8}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: AppColors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel={`Agregar ${product.nombre}`}
          >
            <IconSymbol name="plus" size={18} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
