import AnimatedScreen from "@/components/ui/AnimatedScreen";
import { AppFonts } from "@/constants/typography";
import CartPanel from "@/components/ventas/CartPanel";
import FooterProducts from "@/components/ventas/FooterProducts";
import ProductListContent from "@/components/ventas/ProductListContent";
import { OnboardingHint, useOnboardingAfterLogin } from "@/components/onboarding/OnboardingHint";
import { Tour } from "@/components/onboarding/Tour";
import { VENTAS_TOUR } from "@/constants/tours";
import { useCheckoutStore } from "@/store/checkout-store";
import { useVentasStore } from "@/store/ventas-store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useTour } from "@/hooks/useTour";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
    return (
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1.5">
          <View className="rounded-md bg-[#F5F5F4] dark:bg-[#1A1F2B] px-1.5 py-0.5">
            <Text className="text-[10px] font-medium text-[#9CA3AF] dark:text-[#5A6478]">⌘N</Text>
          </View>
          <Text className="text-[11px] text-[#9CA3AF] dark:text-[#5A6478]">buscar</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="rounded-md bg-[#F5F5F4] dark:bg-[#1A1F2B] px-1.5 py-0.5">
            <Text className="text-[10px] font-medium text-[#9CA3AF] dark:text-[#5A6478]">↵</Text>
          </View>
          <Text className="text-[11px] text-[#9CA3AF] dark:text-[#5A6478]">completar</Text>
        </View>
      </View>
    );
  }, [isDesktop]);

  return (
    <AnimatedScreen className="flex-1 flex-row bg-[#FAFAF9] dark:bg-[#0C0F14]">
      {/* ─── ÁREA PRINCIPAL: CATÁLOGO (Desktop) o CARRITO (Mobile) ────────── */}
      <View
        className="flex-1"
        style={!isDesktop ? { paddingBottom: 144 } : undefined}
      >
        {isDesktop ? (
          /* Catálogo para escritorio */
          <View className="flex-1">
            <View
              className="flex-row items-center justify-between px-6 py-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0,0,0,0.04)",
              }}
            >
              <Text
                className="text-xl font-bold text-[#1A1A1A] dark:text-[#F0F0F0]"
                style={{ fontFamily: AppFonts.heading }}
              >
                Catálogo
              </Text>
              {shortcutsHint}
            </View>
            <ProductListContent
              searchContextId="ventas"
              listKey="desktop-catalog"
              searchInputRef={searchInputRef}
              searchSize="large"
            />
          </View>
        ) : (
          /* Carrito para móvil */
          <View className="flex-1">
            <View
              className="flex-row items-center justify-between px-5 py-4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "rgba(0,0,0,0.04)",
              }}
            >
              <View className="flex-row items-baseline gap-2">
                <Text
                  className="text-xl font-bold text-[#1A1A1A] dark:text-[#F0F0F0]"
                  style={{ fontFamily: AppFonts.heading }}
                >
                  Carrito
                </Text>
                {itemCount > 0 && (
                  <View className="rounded-full bg-[#ea580c] px-2 py-0.5">
                    <Text className="text-[11px] font-bold text-white">
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

      {/* ─── SIDEBAR DERECHO: CARRITO (Sólo Desktop) ─────────────────────── */}
      {isDesktop && (
        <View
          style={{
            width: 420,
            borderLeftWidth: 1,
            borderLeftColor: "rgba(0,0,0,0.06)",
            backgroundColor: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
          }}
        >
          <View
            className="flex-row items-center justify-between px-6 py-4"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: "rgba(0,0,0,0.04)",
            }}
          >
            <View className="flex-row items-baseline gap-2">
              <Text
                className="text-xl font-bold text-[#1A1A1A] dark:text-[#F0F0F0]"
                style={{ fontFamily: AppFonts.heading }}
              >
                Carrito
              </Text>
              {itemCount > 0 && (
                <View className="rounded-full bg-[#ea580c] px-2 py-0.5">
                  <Text className="text-[11px] font-bold text-white">
                    {itemCount}
                  </Text>
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
