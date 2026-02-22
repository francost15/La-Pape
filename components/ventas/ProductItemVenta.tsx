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
  useWindowDimensions,
  View,
} from "react-native";
import CircleIconButton from "../ui/CircleIconButton";
import { IconSymbol } from "../ui/icon-symbol";

const DESKTOP_MIN_WIDTH = 768;

interface ProductItemVentaProps {
  product: Product;
  compact?: boolean;
  onProductAdded?: () => void;
}

export default function ProductItemVenta({
  product,
  compact = false,
  onProductAdded,
}: ProductItemVentaProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const addItem = useVentasStore((s) => s.addItem);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 900);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  const handleAdd = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(product, 1);
    setJustAdded(true);
    onProductAdded?.();
  };

  const hasImage = product.imagen?.trim();
  const placeholderBg = isDark ? "#2C2C2E" : "#F2F2F7";

  const imgSize = isDesktop ? 72 : 52;
  const cardGap = isDesktop ? 16 : 12;
  const cardRadius = isDesktop ? 16 : 14;
  const imgRadius = isDesktop ? 14 : 12;
  const btnSize = isDesktop ? 48 : 36;

  if (compact) {
    return (
      <Pressable
        onPress={handleAdd}
        className={`flex-row items-center rounded-2xl ${
          isDark ? "bg-[#1C1C1E]" : "bg-white"
        } ${Platform.OS === "web" ? "shadow-sm" : ""}`}
        style={{
          gap: cardGap,
          padding: isDesktop ? 14 : 10,
          ...(Platform.OS !== "web" ? { elevation: 1 } : {}),
        }}
      >
        <View
          style={{
            width: imgSize,
            height: imgSize,
            borderRadius: imgRadius,
            backgroundColor: placeholderBg,
            overflow: "hidden",
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
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <IconSymbol
                name="photo.fill"
                size={isDesktop ? 28 : 22}
                color="#C7C7CC"
              />
            </View>
          )}
        </View>

        <View className="flex-1 min-w-0 gap-0.5">
          <Text
            className={`font-medium text-gray-900 dark:text-white ${
              isDesktop ? "text-base" : "text-sm"
            }`}
            numberOfLines={1}
          >
            {product.nombre}
          </Text>
          <Text
            className={`font-bold text-orange-600 ${
              isDesktop ? "text-base" : "text-sm"
            }`}
          >
            ${product.precio_venta.toLocaleString()}
          </Text>
        </View>

        <CircleIconButton
          icon={justAdded ? "checkmark" : "plus"}
          variant={justAdded ? "success" : "primary"}
          onPress={handleAdd}
          size={btnSize}
          interactive={false}
        />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handleAdd}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
        ...(Platform.OS === "web"
          ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
          : { elevation: 2 }),
      }}
    >
      <View
        style={{
          width: "100%",
          height: 100,
          backgroundColor: placeholderBg,
          overflow: "hidden",
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
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <IconSymbol name="photo.fill" size={28} color="#C7C7CC" />
          </View>
        )}
      </View>
      <View style={{ padding: 10, gap: 4 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: isDark ? "#F5F5F7" : "#1D1D1F",
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
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#ea580c",
              letterSpacing: -0.2,
            }}
          >
            ${product.precio_venta.toLocaleString()}
          </Text>
          <CircleIconButton
            icon={justAdded ? "checkmark" : "plus"}
            variant={justAdded ? "success" : "primary"}
            onPress={handleAdd}
            size={36}
            interactive={false}
          />
        </View>
      </View>
    </Pressable>
  );
}
