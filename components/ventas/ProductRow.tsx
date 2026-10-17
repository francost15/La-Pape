import { Thumb } from "@/components/ui/Thumb";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useCartProductActions } from "@/hooks/use-cart-product-actions";
import { useResponsive } from "@/hooks/use-responsive";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { ProductRowProps } from "@/interface/ventas";
import { formatCurrency } from "@/lib/utils/format";
import React, { useCallback } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import QuantityStepper from "./QuantityStepper";

const ROW_LAYOUT = {
  desktop: {
    padY: 16,
    padX: 40,
    gap: 20,
    img: 56,
    radius: 14,
    icon: 20,
    lines: 1,
    price: 18,
    stepper: 34,
  },
  mobile: {
    padY: 12,
    padX: 16,
    gap: 12,
    img: 48,
    radius: 10,
    icon: 18,
    lines: 2,
    price: 16,
    stepper: 32,
  },
} as const;

function webFont(weight: "500" | "600" | "700") {
  if (Platform.OS !== "web") return null;
  return { fontWeight: weight };
}

/**
 * ProductRow — fila de producto del catálogo de ventas.
 *
 * Unifica lo que antes eran `ProductItemVenta` (desktop) y `ProductCardMobile`
 * (mobile): mismo `useCartProductActions`, misma estructura imagen + nombre +
 * precio + stepper/botón "+". El layout (tamaños, padding, divider, marca) se
 * deriva de `isDesktop`; `showBrand`/`divider` permiten overridear ese default.
 */
export default React.memo(function ProductRow({
  product,
  onProductAdded,
  showBrand,
  divider,
}: ProductRowProps) {
  const { isDesktop } = useResponsive();
  const { isDark, colors } = useThemeColors();

  // El padre pasa un handler estable que recibe el nombre; lo invocamos con el
  // propio product.nombre para no romper el React.memo con una prop nueva por render.
  const handleProductAdded = useCallback(
    () => onProductAdded?.(product.nombre),
    [onProductAdded, product.nombre]
  );
  const { quantity, inCart, handleAdd, handlePlus, handleMinus } = useCartProductActions(product, {
    onProductAdded: handleProductAdded,
  });

  // Defaults por breakpoint: mobile muestra marca y divisor; desktop no.
  const withBrand = showBrand ?? !isDesktop;
  const withDivider = divider ?? !isDesktop;

  const layout = isDesktop ? ROW_LAYOUT.desktop : ROW_LAYOUT.mobile;

  return (
    <View
      // @ts-ignore cursor is web-only
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: layout.padY,
        paddingHorizontal: layout.padX,
        gap: layout.gap,
        ...(withDivider ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null),
        ...(Platform.OS === "web" ? { cursor: inCart ? "default" : "pointer" } : null),
      }}
      // @ts-ignore web only onClick
      onClick={Platform.OS === "web" && !inCart ? handleAdd : undefined}
      accessibilityLabel={product.nombre}
    >
      {/* ── Imagen ────────────────────────────────────────────── */}
      <Thumb
        uri={product.imagen}
        size={layout.img}
        borderRadius={layout.radius}
        recyclingKey={product.id}
        iconSize={layout.icon}
        iconColor={isDark ? AppColors.dark.textMuted : "#C7C7CC"}
        style={{
          backgroundColor: isDark ? AppColors.dark.surfaceElevated : AppColors.light.surfaceHover,
          flexShrink: 0,
        }}
      />

      {/* ── Texto ─────────────────────────────────────────────── */}
      <View style={{ flex: 1, minWidth: 0, justifyContent: "center", gap: 2 }}>
        <Text
          style={{
            fontSize: 15,
            color: colors.textPrimary,
            letterSpacing: -0.2,
            fontFamily: AppFonts.bodyStrong,
            // En native el peso va codificado en el archivo de fuente; un
            // fontWeight explícito fuerza bold sintético. En web sí se declara.
            ...webFont("600"),
          }}
          numberOfLines={layout.lines}
        >
          {product.nombre}
        </Text>
        {withBrand && product.marca ? (
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              fontFamily: AppFonts.body,
              ...webFont("500"),
            }}
            numberOfLines={1}
          >
            {product.marca}
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: layout.price,
            color: AppColors.primary,
            letterSpacing: -0.3,
            fontFamily: AppFonts.display,
            ...webFont("700"),
          }}
        >
          {formatCurrency(product.precio_venta)}
        </Text>
      </View>

      {/* ── Acción ────────────────────────────────────────────── */}
      <View style={{ alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {inCart ? (
          <QuantityStepper
            quantity={quantity}
            onMinus={handleMinus}
            onPlus={handlePlus}
            size={layout.stepper}
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
            <IconSymbol name="plus" size={19} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
