import React from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { Platform, Pressable, TextInput, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

interface SearchProductsProps {
  searchText: string;
  onSearchChange: (searchText: string) => void;
  size?: "default" | "large";
  showQrButton?: boolean;
  onQrPress?: () => void;
}

/**
 * SearchProducts — Digital Atelier style.
 *
 * Minimalist search input with premium radius and thematic colors.
 * Uses navy dark mode and stone light mode.
 */
const SearchProducts = React.forwardRef<TextInput, SearchProductsProps>(function SearchProducts(
  { searchText, onSearchChange, size = "default", showQrButton = false, onQrPress },
  ref
) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const haptic = useHaptic();
  const colors = isDark ? AppColors.dark : AppColors.light;

  const bg = isDark ? "#1A1F2B" : "#F5F5F4";
  const textColor = colors.textPrimary;
  const placeholderColor = isDark ? "#5A6478" : "#9CA3AF";
  
  const iconSize = size === "large" ? 20 : 18;
  const inputHeight = size === "large" ? 48 : 42;
  const borderRadius = 14;
  const hasText = searchText.trim().length > 0;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: bg,
          borderRadius: borderRadius,
          paddingHorizontal: 16,
          height: inputHeight,
          gap: 12,
          borderWidth: 1,
          borderColor: isDark ? colors.border : "transparent",
        }}
      >
        <IconSymbol name="magnifyingglass" size={iconSize} color={placeholderColor} />
        <TextInput
          ref={ref}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: textColor,
              fontFamily: AppFonts.body,
              paddingVertical: 0,
              letterSpacing: -0.3,
            },
            // @ts-expect-error outlineStyle is web-only
            Platform.OS === "web" ? { outlineStyle: "none" as const } : undefined,
          ]}
          placeholder="Buscar producto..."
          placeholderTextColor={placeholderColor}
          value={searchText}
          onChangeText={onSearchChange}
        />
        {hasText && (
          <Pressable
            onPress={() => onSearchChange("")}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: isDark ? "#2C3440" : "#E5E5EA",
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Limpiar búsqueda"
          >
            <IconSymbol name="xmark" size={12} color={isDark ? "#F5F5F7" : "#FFFFFF"} />
          </Pressable>
        )}
      </View>

      {showQrButton && (
        <TouchableOpacity
          onPress={() => {
            haptic();
            onQrPress?.();
          }}
          style={{
            width: inputHeight,
            height: inputHeight,
            borderRadius: borderRadius,
            backgroundColor: "#ea580c",
            alignItems: "center",
            justifyContent: "center",
            ...(Platform.OS === "web" ? { boxShadow: "0 4px 12px rgba(234, 88, 12, 0.2)" } : {}),
          }}
          activeOpacity={0.85}
        >
          <IconSymbol name="qrcode" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default SearchProducts;
