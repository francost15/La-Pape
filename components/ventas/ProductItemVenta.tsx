import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { Product } from "@/interface/products";
import { useVentasStore } from "@/store/ventas-store";
import * as Haptics from "expo-haptics";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useEffect, useState, useCallback } from "react";
import { Platform, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { Image } from "expo-image";
import { IconSymbol } from "../ui/icon-symbol";
import QuantityStepper from "./QuantityStepper";

const DESKTOP_MIN_WIDTH = 768;

interface ProductItemVentaProps {
  product: Product;
  compact?: boolean;
  onProductAdded?: () => void;
}

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
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const addItem = useVentasStore((s) => s.addItem);
  const updateQuantity = useVentasStore((s) => s.updateQuantity);
  const removeItem = useVentasStore((s) => s.removeItem);
  const cartItem = useVentasStore((s) => s.items.find((i) => i.productId === product.id));
  const quantity = cartItem?.quantity ?? 0;
  const inCart = quantity > 0;
  const hapticMedium = useHaptic(Haptics.ImpactFeedbackStyle.Medium);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const colors = isDark ? AppColors.dark : AppColors.light;
  const buttonScale = useSharedValue(1);
  const quantityScale = useSharedValue(1);

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 900);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  const handleAdd = useCallback(() => {
    if (!inCart) {
      hapticMedium();
      addItem(product, 1);
      onProductAdded?.();
    }
  }, [inCart, hapticMedium, addItem, product, onProductAdded]);

  const handlePlus = useCallback(() => {
    hapticMedium();
    updateQuantity(product.id, quantity + 1);
  }, [hapticMedium, product.id, quantity, updateQuantity]);

  const handleMinus = useCallback(() => {
    hapticMedium();
    if (quantity === 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  }, [hapticMedium, product.id, quantity, removeItem, updateQuantity]);

  const hasImage = product.imagen?.trim();
  const placeholderBg = isDark ? "#1A1F2B" : "#F5F5F4";

  const imgSize = isDesktop ? 56 : 48;
  const imgRadius = 10;
  const btnSize = isDesktop ? 38 : 36;

  // ── Desktop row (compact) ────────────────────────────────────────────
  // Uses View as outer container → no nested <button> issue.
  // The whole row has a hover effect via web cursor, but interaction
  // is limited to the dedicated CTA on the right side.
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
        ...(Platform.OS === "web"
          ? { cursor: inCart ? "default" : "pointer" }
          : {}),
      }}
      // @ts-ignore web only onClick
      onClick={Platform.OS === "web" && !inCart ? handleAdd : undefined}
      accessibilityLabel={product.nombre}
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <View
        style={{
          width: imgSize,
          height: imgSize,
          borderRadius: 14,
          backgroundColor: placeholderBg,
          overflow: "hidden",
          flexShrink: 0,
        }}
        className="dark:bg-[#1A1F2B]"
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

      {/* ── Text ──────────────────────────────────────────────── */}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text
          style={{
            fontSize: isDesktop ? 15 : 14,
            fontWeight: "700",
            color: colors.textPrimary,
            fontFamily: AppFonts.bodyStrong,
          }}
          className="dark:text-[#F9FAFB] tracking-tight"
          numberOfLines={1}
        >
          {product.nombre}
        </Text>
        <Text
          style={{
            fontSize: isDesktop ? 18 : 16,
            color: "#ea580c",
            fontFamily: AppFonts.display,
            letterSpacing: -0.5,
          }}
          className="dark:text-[#FB923C]"
        >
          ${product.precio_venta.toLocaleString()}
        </Text>
      </View>

      {/* ── Action ────────────────────────────────────────────── */}
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
                backgroundColor: "#ea580c",
                alignItems: "center",
                justifyContent: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel={`Agregar ${product.nombre}`}
            >
              <IconSymbol
                name="plus"
                size={btnSize * 0.5}
                color="#ffffff"
              />
            </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
