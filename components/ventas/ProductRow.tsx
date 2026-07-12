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

  const imgSize = isDesktop ? 56 : 48;
  const imgRadius = isDesktop ? 14 : 10;
  const btnSize = isDesktop ? 38 : 38;
  const stepperSize = isDesktop ? 34 : 32;

  return (
    <View
      // @ts-ignore cursor is web-only
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: isDesktop ? 16 : 12,
        paddingHorizontal: isDesktop ? 40 : 16,
        gap: isDesktop ? 20 : 12,
        ...(withDivider ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null),
        ...(Platform.OS === "web" ? { cursor: inCart ? "default" : "pointer" } : {}),
      }}
      // @ts-ignore web only onClick
      onClick={Platform.OS === "web" && !inCart ? handleAdd : undefined}
      accessibilityLabel={product.nombre}
    >
      {/* ── Imagen ────────────────────────────────────────────── */}
      <Thumb
        uri={product.imagen}
        size={imgSize}
        borderRadius={imgRadius}
        recyclingKey={product.id}
        iconSize={isDesktop ? 20 : 18}
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
            fontSize: isDesktop ? 15 : 15,
            color: colors.textPrimary,
            letterSpacing: -0.2,
            fontFamily: AppFonts.bodyStrong,
            // En native el peso va codificado en el archivo de fuente; un
            // fontWeight explícito fuerza bold sintético. En web sí se declara.
            ...(Platform.OS === "web" ? { fontWeight: "600" as const } : null),
          }}
          numberOfLines={isDesktop ? 1 : 2}
        >
          {product.nombre}
        </Text>
        {withBrand && product.marca ? (
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              fontFamily: AppFonts.body,
              ...(Platform.OS === "web" ? { fontWeight: "500" as const } : null),
            }}
            numberOfLines={1}
          >
            {product.marca}
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: isDesktop ? 18 : 16,
            color: AppColors.primary,
            letterSpacing: -0.3,
            fontFamily: AppFonts.display,
            ...(Platform.OS === "web" ? { fontWeight: "700" as const } : null),
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
            size={stepperSize}
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
