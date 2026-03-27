import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { Product } from "@/interface/products";
import { useVentasStore } from "@/store/ventas-store";
import * as Haptics from "expo-haptics";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { Image } from "expo-image";
import CircleIconButton from "../ui/CircleIconButton";
import { IconSymbol } from "../ui/icon-symbol";
import QuantityStepper from "./QuantityStepper";

const IMG_SIZE = 52;

interface ProductCardMobileProps {
  product: Product;
  onProductAdded?: () => void;
}

/**
 * ProductCardMobile — Digital Atelier style.
 * Clean row with subtle separator. No card chrome.
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
    haptic();
    quantityScale.value = withSpring(1.2, { damping: 4, stiffness: 300 }, () => {
      quantityScale.value = withSpring(1, { damping: 4, stiffness: 300 });
    });
    updateQuantity(product.id, quantity + 1);
  }, [haptic, product.id, quantity, quantityScale, updateQuantity]);

  const handleMinus = useCallback(() => {
    haptic();
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
  }, [haptic, product.id, quantity, quantityScale, removeItem, updateQuantity, buttonScale]);

  const hasImage = product.imagen?.trim();
  const colors = isDark ? AppColors.dark : AppColors.light;
  const borderColor = colors.border;

  return (
    <Pressable
      onPress={inCart ? undefined : handleAdd}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: pressed && !inCart ? colors.surfaceHover : "transparent",
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        gap: 14,
      })}
      accessibilityRole={inCart ? undefined : "button"}
      accessibilityLabel={product.nombre}
      accessibilityHint={inCart ? "Producto en el carrito" : "Agregar al carrito"}
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
            <IconSymbol name="photo.fill" size={22} color={isDark ? "#5A6478" : "#C7C7CC"} />
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
            marginTop: 4,
          }}
        >
          ${product.precio_venta.toLocaleString()}
        </Text>
      </View>

      {/* Action button */}
      <View style={{ alignItems: "center", justifyContent: "center", paddingLeft: 4 }}>
        {inCart ? (
          <Animated.View style={{ transform: [{ scale: quantityScale }] }}>
            <QuantityStepper
              quantity={quantity}
              onMinus={handleMinus}
              onPlus={handlePlus}
              size={32}
            />
          </Animated.View>
        ) : (
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <CircleIconButton
              icon={justAdded ? "checkmark" : "plus"}
              variant={justAdded ? "success" : "primary"}
              onPress={handleAdd}
              size={38}
              interactive={true}
            />
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
});
