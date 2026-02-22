import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Vista de productos para móvil: FAB "Agregar productos".
 * El sheet se renderiza en AddProductsSheet (root layout) para que
 * las notificaciones queden encima sin bloquear interacción.
 */
export default function FooterProducts() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const sheetVisible = useVentasUIStore((s) => s.sheetVisible);
  const openSheet = useVentasUIStore((s) => s.openSheet);

  const handleOpenSheet = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    openSheet();
  }, [openSheet]);

  const TAB_BAR_CLEARANCE = 96 + insets.bottom;
  const isDark = (colorScheme ?? "light") === "dark";

  const fabBg = isDark ? "rgba(44,44,46,0.98)" : "rgba(255,255,255,0.98)";
  const fabTextColor = isDark ? "#FFFFFF" : "#1D1D1F";
  const fabBorderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const fabShadow = isDark
    ? "0 2px 12px rgba(0,0,0,0.35)"
    : "0 2px 12px rgba(0,0,0,0.1)";

  return (
    <>
      {!sheetVisible && (
        <Pressable
          onPress={handleOpenSheet}
          style={{
            position: "absolute",
            bottom: TAB_BAR_CLEARANCE,
            left: 12,
            right: 12,
            zIndex: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: fabBg,
            borderWidth: 1,
            borderColor: fabBorderColor,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            ...(Platform.OS === "web"
              ? { boxShadow: fabShadow }
              : {
                  shadowColor: isDark ? "#000" : "#1c1917",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.35 : 0.12,
                  shadowRadius: 10,
                  elevation: 8,
                }),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text
              style={{
                color: fabTextColor,
                fontSize: 15,
                fontWeight: "600",
                letterSpacing: 0,
              }}
            >
              Agregar productos
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <IconSymbol name="chevron.up" size={18} color={fabTextColor} />
          </View>
        </Pressable>
      )}
    </>
  );
}
