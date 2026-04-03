import { OnboardingHint, useOnboardingAfterLogin } from "@/components/onboarding/OnboardingHint";
import { Tour } from "@/components/onboarding/Tour";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import CartPanel from "@/components/ventas/CartPanel";
import FooterProducts from "@/components/ventas/FooterProducts";
import ProductListContent from "@/components/ventas/ProductListContent";
import { VENTAS_TOUR } from "@/constants/tours";
import { AppFonts } from "@/constants/typography";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTour } from "@/hooks/useTour";
import { useCheckoutStore } from "@/store/checkout-store";
import { useVentasStore } from "@/store/ventas-store";
import React, { useCallback, useEffect, useRef } from "react";
import { Text, TextInput, useWindowDimensions, View } from "react-native";

const DESKTOP_MIN_WIDTH = 768;

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

  const shortcutsHint = React.useMemo(() => {
    if (!isDesktop) return null;
  }, [isDesktop]);

  return (
    <AnimatedScreen className="flex-1 flex-row bg-[#FAFAF9] dark:bg-[#0C0F14]">
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
                  className="mb-2 text-[9px] font-bold tracking-[0.3em] text-[#9CA3AF] uppercase dark:text-[#5A6478]"
                  style={{ fontFamily: AppFonts.bodyStrong }}
                >
                  ORDEN ACTUAL
                </Text>
                <View className="flex-row items-center gap-2.5">
                  <Text
                    className="text-3xl tracking-tight text-[#111827] dark:text-[#F9FAFB]"
                    style={{ fontFamily: AppFonts.display }}
                  >
                    Carrito
                  </Text>
                  {itemCount > 0 && (
                    <View className="rounded-full bg-[#ea580c] px-2.5 py-0.5">
                      <Text className="text-[12px] leading-none font-bold text-white">{itemCount}</Text>
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
            borderLeftColor: "rgba(0,0,0,0.03)",
          }}
          className="bg-white dark:bg-[#111820]"
        >
          <View className="px-6 pt-12 pb-6">
            <Text
              className="mb-2 text-[9px] font-bold tracking-[0.3em] text-[#9CA3AF] uppercase dark:text-[#5A6478]"
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              ORDEN ACTUAL
            </Text>
            <View className="flex-row items-center gap-2.5">
              <Text
                className="text-2xl tracking-tight text-[#111827] dark:text-[#F9FAFB]"
                style={{ fontFamily: AppFonts.display }}
              >
                Carrito
              </Text>
              {itemCount > 0 && (
                <View className="rounded-full bg-[#ea580c] px-2.5 py-0.5">
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
