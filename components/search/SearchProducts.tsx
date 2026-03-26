import React from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptic } from "@/hooks/use-haptic";
import { Platform, Pressable, TextInput, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

interface SearchProductsProps {
  searchText: string;
  onSearchChange: (searchText: string) => void;
  size?: "default" | "large";
  showQrButton?: boolean;
  onQrPress?: () => void;
}

const SearchProducts = React.forwardRef<TextInput, SearchProductsProps>(function SearchProducts(
  { searchText, onSearchChange, size = "default", showQrButton = false, onQrPress },
  ref
) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const haptic = useHaptic();

  const bg = isDark ? "#2C2C2E" : "#F2F2F7";
  const textColor = isDark ? "#F5F5F7" : "#1D1D1F";
  const placeholderColor = isDark ? "#8E8E93" : "#8E8E93";
  const iconSize = size === "large" ? 20 : 18;
  const inputHeight = size === "large" ? 44 : 40;
  const hasText = searchText.trim().length > 0;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: bg,
          borderRadius: 12,
          paddingHorizontal: 12,
          height: inputHeight,
          gap: 8,
        }}
      >
        <IconSymbol name="magnifyingglass" size={iconSize} color={placeholderColor} />
        <TextInput
          ref={ref}
          style={[
            {
              flex: 1,
              fontSize: 15,
              color: textColor,
              paddingVertical: 0,
              letterSpacing: -0.2,
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
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: isDark ? "#48484A" : "#C7C7CC",
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Limpiar búsqueda"
          >
            <IconSymbol name="xmark" size={10} color={isDark ? "#F5F5F7" : "#FFFFFF"} />
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
            borderRadius: 12,
            backgroundColor: "#ea580c",
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.85}
        >
          <IconSymbol name="qrcode" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default SearchProducts;
