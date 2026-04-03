import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { Product } from "@/interface/products";
import { useVentasStore } from "@/store/ventas-store";
import * as Haptics from "expo-haptics";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { Image } from "expo-image";
import { IconSymbol } from "../ui/icon-symbol";
import QuantityStepper from "./QuantityStepper";

const IMG_SIZE = 48;

interface ProductCardMobileProps {
  product: Product;
  onProductAdded?: () => void;
}

/**
 * ProductCardMobile — Digital Atelier style.
 * Clean row with subtle separator. No nested buttons.
 *
 * Uses View as the outer container to avoid the
 * <button> inside <button> hydration error on web.
 */
export default React.memo(function ProductCardMobile({
  product,
  onProductAdded,
}: ProductCardMobileProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const haptic = useHaptic();
  const hapticMedium = useHaptic(Haptics.ImpactFeedbackStyle.Medium);
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const buttonScale = useSharedValue(1);
  const quantityScale = useSharedValue(1);

  const addItem = useVentasStore((s) => s.addItem);
  const updateQuantity = useVentasStore((s) => s.updateQuantity);
  const removeItem = useVentasStore((s) => s.removeItem);
  const cartItem = useVentasStore((s) => s.items.find((i) => i.productId === product.id));

  const quantity = cartItem?.quantity ?? 0;
  const inCart = quantity > 0;

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 800);
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
    haptic();
    updateQuantity(product.id, quantity + 1);
  }, [haptic, product.id, quantity, updateQuantity]);

  const handleMinus = useCallback(() => {
    haptic();
    if (quantity === 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  }, [haptic, product.id, quantity, removeItem, updateQuantity]);

  const hasImage = product.imagen?.trim();
  const colors = isDark ? AppColors.dark : AppColors.light;

  return (
    <View
      // @ts-ignore cursor is web-only
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        gap: 12,
        ...(Platform.OS === "web"
          ? { cursor: inCart ? "default" : "pointer" }
          : {}),
      }}
      // @ts-ignore web only onClick
      onClick={Platform.OS === "web" && !inCart ? handleAdd : undefined}
      accessibilityLabel={product.nombre}
    >
      {/* Image */}
      <View
        style={{
          width: IMG_SIZE,
          height: IMG_SIZE,
          borderRadius: 10,
          backgroundColor: isDark ? AppColors.dark.surfaceElevated : "#F5F5F4",
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
            <IconSymbol name="photo.fill" size={20} color={isDark ? "#5A6478" : "#C7C7CC"} />
          </View>
        )}
      </View>

      {/* Text content */}
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
            color: isDark ? "#F97316" : "#ea580c",
            letterSpacing: -0.3,
            fontFamily: AppFonts.display,
            marginTop: 3,
          }}
        >
          ${product.precio_venta.toLocaleString()}
        </Text>
      </View>

      {/* Action button */}
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
                backgroundColor: "#ea580c",
                alignItems: "center",
                justifyContent: "center",
              }}
              accessibilityRole="button"
              accessibilityLabel={`Agregar ${product.nombre}`}
            >
              <IconSymbol
                name="plus"
                size={18}
                color="#ffffff"
              />
            </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
