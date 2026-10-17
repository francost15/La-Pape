import { Tour } from "@/components/onboarding/Tour";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import AppText from "@/components/ui/AppText";
import CartPanel from "@/components/ventas/CartPanel";
import FooterProducts from "@/components/ventas/FooterProducts";
import ProductListContent from "@/components/ventas/ProductListContent";
import { AppColors } from "@/constants/colors";
import { VENTAS_TOUR } from "@/constants/tours";
import { AppFonts } from "@/constants/typography";
import { useResponsive } from "@/hooks/use-responsive";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCheckoutStore } from "@/store/checkout-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { CartHeaderProps } from "@/interface/ventas";
import { useVentasStore } from "@/store/ventas-store";
import React, { useCallback, useEffect, useRef } from "react";
import { Text, TextInput, View } from "react-native";

// Encabezado del carrito compartido entre el layout móvil y el sidebar desktop:
// mismo contenido, solo cambian paddings y escala tipográfica.
// El pt-12 es ritmo visual bajo el Navbar (que ya consume el safe-area inset),
// no compensación de status bar.
function CartHeader({ variant, itemCount }: CartHeaderProps) {
  const { colors } = useThemeColors();
  const isMobile = variant === "mobile";

  return (
    <View className={`${isMobile ? "px-5" : "px-6"} pt-12 pb-6`}>
      {/* Eyebrow canónico (color textLabel AA); se conserva el tracking amplio original */}
      <AppText variant="eyebrow" className="mb-2" style={{ letterSpacing: 2.7 }}>
        Orden Actual
      </AppText>
      <View className="flex-row items-center gap-2.5">
        <Text
          className={`${isMobile ? "text-3xl" : "text-2xl"} tracking-tight`}
          style={{
            fontFamily: AppFonts.display,
            color: colors.textPrimary,
          }}
        >
          Carrito
        </Text>
        {itemCount > 0 && (
          <View
            className="rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: AppColors.primary }}
          >
            <Text className="text-[12px] leading-none font-bold text-white">{itemCount}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function VentasScreen() {
  const { isDesktop } = useResponsive();
  const { isDark, colors } = useThemeColors();
  const itemCount = useVentasStore((s) => s.getItemCount());
  const openConfirm = useCheckoutStore((s) => s.openConfirm);
  const searchInputRef = useRef<TextInput>(null);
  const startTour = useOnboardingStore((s) => s.startTour);
  const completeTour = useOnboardingStore((s) => s.completeTour);

  useEffect(() => {
    startTour("ventas", VENTAS_TOUR);
  }, [startTour]);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const shortcuts = React.useMemo(
    () => [
      {
        key: "n",
        ctrl: true,
        handler: focusSearch,
        description: "Enfocar búsqueda",
      },
      {
        key: "/",
        handler: focusSearch,
        description: "Enfocar búsqueda",
      },
      {
        key: "Enter",
        handler: () => {
          if (itemCount > 0) {
            openConfirm();
          }
        },
        description: "Completar venta",
      },
    ],
    [focusSearch, itemCount, openConfirm]
  );

  useKeyboardShortcuts(shortcuts, isDesktop);

  return (
    <AnimatedScreen className="flex-1 flex-row" style={{ backgroundColor: colors.canvas }}>
      {/* ─── ÁREA PRINCIPAL: ATELIER (CATÁLOGO) / CARRITO (MÓVIL) ────────── */}
      <View className="flex-1" style={!isDesktop ? { paddingBottom: 144 } : { flex: 0.7 }}>
        <View className="flex-1">
          {isDesktop ? (
            <ProductListContent
              searchContextId="ventas"
              listKey="desktop-catalog"
              searchInputRef={searchInputRef}
              searchSize="large"
            />
          ) : (
            <View className="flex-1">
              <CartHeader variant="mobile" itemCount={itemCount} />
              <CartPanel />
            </View>
          )}
        </View>
      </View>

      {/* ─── SIDEBAR DERECHO: CARRITO (Desktop Split) ─────────────────────── */}
      {isDesktop && (
        <View
          style={{
            flex: 0.3,
            borderLeftWidth: 1.5,
            borderLeftColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
            backgroundColor: colors.surface,
          }}
        >
          <CartHeader variant="desktop" itemCount={itemCount} />
          <CartPanel />
        </View>
      )}

      {!isDesktop && <FooterProducts />}

      <Tour onComplete={completeTour} />
    </AnimatedScreen>
  );
}
