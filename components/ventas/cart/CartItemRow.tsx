import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { ThemeColors } from "@/hooks/use-theme-colors";
import { formatCurrency } from "@/lib/utils/format";
import type { CartItem } from "@/interface/ventas";
import { Image } from "expo-image";
import { Platform, Text, View } from "react-native";
import { IconSymbol } from "../../ui/icon-symbol";
import QuantityStepper from "../QuantityStepper";

interface CartItemRowProps {
  item: CartItem;
  isDark: boolean;
  colors: ThemeColors;
  onMinus: (item: CartItem) => void;
  onPlus: (item: CartItem) => void;
}

export function CartItemRow({ item, isDark, colors, onMinus, onPlus }: CartItemRowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingHorizontal: 24,
        paddingVertical: 16,
      }}
      accessibilityLabel={`${item.product.nombre}, cantidad ${item.quantity}, precio ${formatCurrency(item.unitPrice)}`}
    >
      <View
        style={{
          height: 64,
          width: 64,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: isDark ? AppColors.dark.surfaceElevated : AppColors.light.surfaceHover,
          flexShrink: 0,
          ...(Platform.OS === "web" ? { boxShadow: "0 4px 12px rgba(0,0,0,0.03)" } : {}),
        }}
      >
        {item.product.imagen?.trim() ? (
          <Image
            source={{ uri: item.product.imagen }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <IconSymbol name="photo.fill" size={24} color={colors.textMuted} />
          </View>
        )}
      </View>

      <View style={{ flex: 1, minWidth: 0, justifyContent: "center", gap: 2 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: colors.textPrimary,
            fontFamily: AppFonts.bodyStrong,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {item.product.nombre}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            fontFamily: AppFonts.body,
          }}
          numberOfLines={1}
        >
          {formatCurrency(item.unitPrice)} cada uno
        </Text>
      </View>

      <View style={{ alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: colors.textPrimary,
            fontFamily: AppFonts.bodyStrong,
          }}
        >
          {formatCurrency(item.unitPrice * item.quantity)}
        </Text>
        <QuantityStepper
          quantity={item.quantity}
          onMinus={() => onMinus(item)}
          onPlus={() => onPlus(item)}
        />
      </View>
    </View>
  );
}
