import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppFonts } from "@/constants/typography";
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

const IMG_SIZE = 56;

interface ProductCardMobileProps {
  product: Product;
  onProductAdded?: () => void;
}

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
  const placeholderBg = isDark ? "#2C2C2E" : "#F2F2F7";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const pressedBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  return (
    <Pressable
      onPress={inCart ? undefined : handleAdd}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: pressed && !inCart ? pressedBg : "transparent",
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        gap: 14,
      })}
      accessibilityRole={inCart ? undefined : "button"}
      accessibilityLabel={product.nombre}
      accessibilityHint={inCart ? "Producto en el carrito" : "Agregar al carrito"}
    >
      <View
        style={{
          width: IMG_SIZE,
          height: IMG_SIZE,
          borderRadius: 8,
          backgroundColor: placeholderBg,
          overflow: "hidden",
          flexShrink: 0,
          borderWidth: 1,
          borderColor: borderColor,
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
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSymbol name="photo.fill" size={24} color="#C7C7CC" />
          </View>
        )}
      </View>

      <View style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 2,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: isDark ? "#F5F5F7" : "#1D1D1F",
              letterSpacing: -0.2,
              flex: 1,
              marginRight: 8,
              fontFamily: AppFonts.bodyStrong,
            }}
            numberOfLines={2}
          >
            {product.nombre}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {product.marca ? (
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#9CA3AF" : "#6B7280",
                fontWeight: "500",
                fontFamily: AppFonts.body,
              }}
              numberOfLines={1}
            >
              {product.marca}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#ea580c",
              letterSpacing: -0.3,
              fontFamily: AppFonts.display,
            }}
          >
            ${product.precio_venta.toLocaleString()}
          </Text>
        </View>
      </View>

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
              size={40}
              interactive={true}
            />
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
});
