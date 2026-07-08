import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useHaptic } from "@/hooks/use-haptic";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { SearchProductsProps } from "@/interface/product-search";
import React from "react";
import { Platform, Pressable, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { IconSymbol } from "../ui/icon-symbol";

/**
 * SearchProducts — Digital Atelier style.
 *
 * Input de búsqueda minimalista con interacciones premium.
 */
const SearchProducts = React.forwardRef<TextInput, SearchProductsProps>(function SearchProducts(
  { searchText, onSearchChange, size = "default", showQrButton = false, onQrPress },
  ref
) {
  const { isDark, colors } = useThemeColors();
  const haptic = useHaptic();
  const [isFocused, setIsFocused] = React.useState(false);

  const borderRadius = 14;
  const iconSize = size === "large" ? 20 : 18;
  const inputHeight = size === "large" ? 48 : 44;
  const hasText = searchText.trim().length > 0;

  // Premium Animated Container Style
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(
        isDark
          ? isFocused
            ? AppColors.dark.surfaceElevated // Lighter/focused bg in dark mode
            : AppColors.dark.canvas // Match with canvas initially
          : isFocused
            ? "#FFFFFF" // White when active in light mode
            : AppColors.light.surfaceHover, // Subtle gray otherwise
        { duration: 250 }
      ),
      borderColor: withTiming(
        isFocused ? AppColors.primary : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        { duration: 250 }
      ),
    };
  });

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Animated.View
        style={[
          {
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            borderRadius,
            paddingHorizontal: 16,
            height: inputHeight,
            gap: 12,
            borderWidth: isFocused ? 1.5 : 1,
            ...(Platform.OS === "web" && isFocused
              ? { boxShadow: `0 0 0 3px ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}` }
              : {}),
          },
          animatedContainerStyle,
        ]}
      >
        <IconSymbol
          name="magnifyingglass"
          size={iconSize}
          color={isFocused ? colors.textPrimary : colors.textMuted}
        />
        <TextInput
          ref={ref}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: colors.textPrimary,
              fontFamily: AppFonts.body,
              paddingVertical: 0,
              letterSpacing: -0.3,
            },
            // @ts-expect-error outlineStyle is web-only
            Platform.OS === "web" ? { outlineStyle: "none" as const } : undefined,
          ]}
          placeholder="Buscar producto..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={onSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={AppColors.primary}
        />
        {hasText && (
          <Pressable
            onPress={() => {
              haptic();
              onSearchChange("");
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: isDark ? AppColors.dark.surfaceHover : "#E5E5EA",
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Limpiar búsqueda"
          >
            <IconSymbol name="xmark" size={13} color={isDark ? "#F5F5F7" : "#FFFFFF"} />
          </Pressable>
        )}
      </Animated.View>

      {showQrButton && (
        <TouchableOpacity
          onPress={() => {
            haptic();
            onQrPress?.();
          }}
          style={{
            width: inputHeight,
            height: inputHeight,
            borderRadius,
            backgroundColor: isDark ? AppColors.dark.surfaceElevated : AppColors.light.surfaceHover,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            ...(Platform.OS === "web" ? { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" } : {}),
          }}
          activeOpacity={0.85}
          accessibilityLabel="Escanear QR"
        >
          <IconSymbol name="qrcode" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default SearchProducts;
