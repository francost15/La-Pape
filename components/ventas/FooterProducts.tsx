import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback } from "react";
import { Platform, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * FooterProducts — FAB flotante en mobile para abrir el sheet de productos.
 * El sheet se renderiza en AddProductsSheet (root layout) para que
 * las notificaciones queden encima sin bloquear interacción.
 */
export default function FooterProducts() {
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeColors();
  const sheetVisible = useVentasUIStore((s) => s.sheetVisible);
  const openSheet = useVentasUIStore((s) => s.openSheet);
  const haptic = useHaptic();

  const handleOpenSheet = useCallback(() => {
    haptic();
    openSheet();
  }, [haptic, openSheet]);

  const TAB_BAR_CLEARANCE = 96 + insets.bottom;

  const fabBg = isDark ? AppColors.dark.surface : AppColors.light.surface;
  const fabTextColor = isDark ? AppColors.dark.textPrimary : AppColors.light.textPrimary;
  const fabBorderColor = isDark ? AppColors.dark.borderStrong : AppColors.light.borderStrong;
  const fabShadow = isDark ? "0 2px 12px rgba(0,0,0,0.35)" : "0 2px 12px rgba(0,0,0,0.1)";

  if (sheetVisible) return null;

  return (
    <Pressable
      onPress={handleOpenSheet}
      style={({ pressed }) => ({
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
        opacity: pressed ? 0.92 : 1,
        ...(Platform.OS === "web"
          ? { boxShadow: fabShadow }
          : {
              shadowColor: isDark ? "#000" : "#1c1917",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.35 : 0.12,
              shadowRadius: 10,
              elevation: 8,
            }),
      })}
      accessibilityRole="button"
      accessibilityLabel="Agregar productos"
      accessibilityHint="Abre el panel para buscar y añadir productos al carrito"
    >
      <Text
        style={{
          color: fabTextColor,
          fontSize: 15,
          fontFamily: AppFonts.bodyStrong,
          letterSpacing: 0,
        }}
      >
        Agregar productos
      </Text>
      <IconSymbol name="chevron.up" size={18} color={fabTextColor} />
    </Pressable>
  );
}
