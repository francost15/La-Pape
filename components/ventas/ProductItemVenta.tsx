import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { Product } from "@/interface/products";
import { useVentasStore } from "@/store/ventas-store";
import * as Haptics from "expo-haptics";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useEffect, useState, useCallback } from "react";
import { Platform, Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { Image } from "expo-image";
import CircleIconButton from "../ui/CircleIconButton";
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
 * Immersive list item for sales catalog.
 * Supports compact (sidebar) and full grid layouts.
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

  const handleAdd = () => {
    if (!inCart) {
      hapticMedium();
      buttonScale.value = withSpring(0.85, { damping: 6, stiffness: 500 }, () => {
        buttonScale.value = withSpring(1.1, { damping: 4, stiffness: 400 }, () => {
          buttonScale.value = withSpring(1, { damping: 6, stiffness: 400 });
        });
      });
      addItem(product, 1);
      setJustAdded(true);
      onProductAdded?.();
    }
  };

  const handlePlus = useCallback(() => {
    hapticMedium();
    quantityScale.value = withSpring(1.2, { damping: 4, stiffness: 300 }, () => {
      quantityScale.value = withSpring(1, { damping: 4, stiffness: 300 });
    });
    updateQuantity(product.id, quantity + 1);
  }, [hapticMedium, product.id, quantity, quantityScale, updateQuantity]);

  const handleMinus = useCallback(() => {
    hapticMedium();
    if (quantity === 1) {
      buttonScale.value = withSpring(0.95, { damping: 6, stiffness: 400 });
      setTimeout(() => {
        removeItem(product.id);
        buttonScale.value = withSpring(1, { damping: 6, stiffness: 400 });
      }, 150);
    } else {
      quantityScale.value = withSpring(0.85, { damping: 4, stiffness: 300 }, () => {
        quantityScale.value = withSpring(1, { damping: 4, stiffness: 300 });
      });
      updateQuantity(product.id, quantity - 1);
    }
  }, [hapticMedium, product.id, quantity, quantityScale, removeItem, updateQuantity, buttonScale]);

  const hasImage = product.imagen?.trim();
  const placeholderBg = isDark ? "#1A1F2B" : "#F5F5F4";

  const imgSize = isDesktop ? 64 : 52;
  const cardGap = isDesktop ? 16 : 14;
  const imgRadius = 14;
  const btnSize = isDesktop ? 44 : 38;

  const PriceText = () => (
    <Text
      style={{
        fontSize: isDesktop ? 17 : 16,
        fontWeight: "800",
        color: isDark ? "#F97316" : "#ea580c",
        fontFamily: AppFonts.display,
        letterSpacing: -0.5,
      }}
    >
      ${product.precio_venta.toLocaleString()}
    </Text>
  );

  if (compact) {
    return (
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: pressed && !inCart ? colors.surfaceHover : colors.surfaceElevated,
          borderRadius: 20,
          padding: 12,
          gap: cardGap,
          borderWidth: 1.5,
          borderColor: colors.border,
          ...(Platform.OS === "web"
            ? { boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }
            : { elevation: 1 }),
        })}
        accessibilityRole="button"
        accessibilityLabel={product.nombre}
        accessibilityHint="Agregar al carrito"
      >
        <View
          style={{
            width: imgSize,
            height: imgSize,
            borderRadius: imgRadius,
            backgroundColor: placeholderBg,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
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
              <IconSymbol name="photo.fill" size={isDesktop ? 22 : 20} color={isDark ? "#48484A" : "#D1D1D6"} />
            </View>
          )}
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text
            style={{
              fontSize: isDesktop ? 15 : 14,
              fontWeight: "600",
              color: colors.textPrimary,
              fontFamily: AppFonts.bodyStrong,
              letterSpacing: -0.2,
            }}
            numberOfLines={1}
          >
            {product.nombre}
          </Text>
          <PriceText />
        </View>

        <View style={{ paddingLeft: 4 }}>
          {inCart ? (
            <Animated.View style={{ transform: [{ scale: quantityScale }] }}>
              <QuantityStepper
                quantity={quantity}
                onMinus={handleMinus}
                onPlus={handlePlus}
                size={34}
              />
            </Animated.View>
          ) : (
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <CircleIconButton
                icon={justAdded ? "checkmark" : "plus"}
                variant={justAdded ? "success" : "primary"}
                onPress={handleAdd}
                size={btnSize}
                interactive={true}
              />
            </Animated.View>
          )}
        </View>
      </Pressable>
    );
  }

  // Full variant (grid)
  return (
    <Pressable
      onPress={handleAdd}
      style={({ pressed }) => ({
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: pressed && !inCart ? colors.surfaceHover : colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
        ...(Platform.OS === "web"
          ? { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }
          : { elevation: 3 }),
      })}
      accessibilityRole="button"
      accessibilityLabel={product.nombre}
    >
      <View
        style={{
          width: "100%",
          height: 120,
          backgroundColor: placeholderBg,
          overflow: "hidden",
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
            <IconSymbol name="photo.fill" size={32} color={isDark ? "#48484A" : "#D1D1D6"} />
          </View>
        )}
      </View>
      <View style={{ padding: 14, gap: 10 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: colors.textPrimary,
            fontFamily: AppFonts.bodyStrong,
            letterSpacing: -0.2,
          }}
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <PriceText />
          {inCart ? (
            <Animated.View style={{ transform: [{ scale: quantityScale }] }}>
              <QuantityStepper
                quantity={quantity}
                onMinus={handleMinus}
                onPlus={handlePlus}
                size={36}
              />
            </Animated.View>
          ) : (
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <CircleIconButton
                icon={justAdded ? "checkmark" : "plus"}
                variant={justAdded ? "success" : "primary"}
                onPress={handleAdd}
                size={btnSize}
                interactive={true}
              />
            </Animated.View>
          )}
        </View>
      </View>
    </Pressable>
  );
});
