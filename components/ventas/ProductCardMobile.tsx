import { useColorScheme } from "@/hooks/use-color-scheme";
import { Product } from "@/interface/products";
import { useVentasStore } from "@/store/ventas-store";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import CircleIconButton from "../ui/CircleIconButton";
import { IconSymbol } from "../ui/icon-symbol";
import QuantityStepper from "./QuantityStepper";

const IMG_SIZE = 56;

interface ProductCardMobileProps {
  product: Product;
  onProductAdded?: () => void;
}

/**
 * Item de lista optimizado para móvil (diseño compacto "List Item").
 * Usa ventas-store (addItem, items, updateQuantity).
 */
export default function ProductCardMobile({
  product,
  onProductAdded,
}: ProductCardMobileProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useVentasStore((s) => s.addItem);
  const updateQuantity = useVentasStore((s) => s.updateQuantity);
  const cartItem = useVentasStore((s) =>
    s.items.find((i) => i.productId === product.id)
  );

  const quantity = cartItem?.quantity ?? 0;
  const inCart = quantity > 0;

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 800);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  const handleAdd = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(product, 1);
    setJustAdded(true);
    onProductAdded?.();
  };

  const handlePlus = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(product.id, quantity + 1);
  };

  const handleMinus = () => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateQuantity(product.id, quantity - 1);
  };

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
            resizeMode="cover"
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: isDark ? "#F5F5F7" : "#1D1D1F",
              letterSpacing: -0.2,
              flex: 1,
              marginRight: 8,
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
            }}
          >
            ${product.precio_venta.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={{ alignItems: "center", justifyContent: "center", paddingLeft: 4 }}>
        {inCart ? (
          <QuantityStepper
            quantity={quantity}
            onMinus={handleMinus}
            onPlus={handlePlus}
            size={32}
          />
        ) : (
          <CircleIconButton
            icon={justAdded ? "checkmark" : "plus"}
            variant={justAdded ? "success" : "primary"}
            onPress={handleAdd}
            size={40}
            interactive={true}
          />
        )}
      </View>
    </Pressable>
  );
}
