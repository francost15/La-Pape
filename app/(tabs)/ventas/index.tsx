import { OnboardingHint, useOnboardingAfterLogin } from "@/components/onboarding/OnboardingHint";
import { Tour } from "@/components/onboarding/Tour";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import CartPanel from "@/components/ventas/CartPanel";
import FooterProducts from "@/components/ventas/FooterProducts";
import ProductListContent from "@/components/ventas/ProductListContent";
import { VENTAS_TOUR } from "@/constants/tours";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTour } from "@/hooks/useTour";
import { useCheckoutStore } from "@/store/checkout-store";
import { useVentasStore } from "@/store/ventas-store";
import { DESKTOP_MIN_WIDTH } from "@/constants/design-system";
import React, { useCallback, useEffect, useRef } from "react";
import { Text, TextInput, useWindowDimensions, View } from "react-native";

export default function VentasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const itemCount = useVentasStore((s) => s.getItemCount());
  const openConfirm = useCheckoutStore((s) => s.openConfirm);
  const searchInputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isOpen, startTour, completeTour } = useTour("ventas", VENTAS_TOUR);

  useOnboardingAfterLogin();

  useEffect(() => {
    startTour();
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
    <AnimatedScreen
      className="flex-1 flex-row"
      style={{ backgroundColor: isDark ? AppColors.dark.canvas : AppColors.light.canvas }}
    >
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
              <View className="px-5 pt-12 pb-6">
                <Text
                  className="mb-2 text-[9px] font-bold tracking-[0.3em] uppercase"
                  style={{
                    fontFamily: AppFonts.bodyStrong,
                    color: isDark ? AppColors.dark.textMuted : AppColors.light.textMuted,
                  }}
                >
                  ORDEN ACTUAL
                </Text>
                <View className="flex-row items-center gap-2.5">
                  <Text
                    className="text-3xl tracking-tight"
                    style={{
                      fontFamily: AppFonts.display,
                      color: isDark ? AppColors.dark.textPrimary : AppColors.light.textPrimary,
                    }}
                  >
                    Carrito
                  </Text>
                  {itemCount > 0 && (
                    <View
                      className="rounded-full px-2.5 py-0.5"
                      style={{ backgroundColor: AppColors.primary }}
                    >
                      <Text className="text-[12px] leading-none font-bold text-white">
                        {itemCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
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
            backgroundColor: isDark ? AppColors.dark.surface : AppColors.light.surface,
          }}
        >
          <View className="px-6 pt-12 pb-6">
            <Text
              className="mb-2 text-[9px] font-bold tracking-[0.3em] uppercase"
              style={{
                fontFamily: AppFonts.bodyStrong,
                color: isDark ? AppColors.dark.textMuted : AppColors.light.textMuted,
              }}
            >
              ORDEN ACTUAL
            </Text>
            <View className="flex-row items-center gap-2.5">
              <Text
                className="text-2xl tracking-tight"
                style={{
                  fontFamily: AppFonts.display,
                  color: isDark ? AppColors.dark.textPrimary : AppColors.light.textPrimary,
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
          <CartPanel />
        </View>
      )}

      {!isDesktop && <FooterProducts />}

      <OnboardingHint />
      <Tour steps={VENTAS_TOUR} isOpen={isOpen} onClose={completeTour} onComplete={completeTour} />
    </AnimatedScreen>
  );
}
