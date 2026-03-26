import AnimatedScreen from "@/components/ui/AnimatedScreen";
import { AppFonts } from "@/constants/typography";
import CartPanel from "@/components/ventas/CartPanel";
import FooterProducts from "@/components/ventas/FooterProducts";
import ProductListContent from "@/components/ventas/ProductListContent";
import SidebarProducts from "@/components/ventas/SidebarProducts";
import { OnboardingHint, useOnboardingAfterLogin } from "@/components/onboarding/OnboardingHint";
import { useCheckoutStore } from "@/store/checkout-store";
import { useVentasStore } from "@/store/ventas-store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import React, { useCallback, useRef } from "react";
import { Text, TextInput, useWindowDimensions, View } from "react-native";

const DESKTOP_MIN_WIDTH = 768;

export default function VentasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const itemCount = useVentasStore((s) => s.getItemCount());
  const openConfirm = useCheckoutStore((s) => s.openConfirm);
  const searchInputRef = useRef<TextInput>(null);

  useOnboardingAfterLogin();

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
      <View className="flex-row items-center gap-4">
        <Text className="text-xs text-gray-400 dark:text-gray-500">Ctrl+N para buscar</Text>
      </View>
    );
  }, [isDesktop]);

  return (
    <AnimatedScreen className="flex-1 flex-row bg-white dark:bg-neutral-900">
      {isDesktop && <SidebarProducts />}

      <View
        className={`flex-1 ${isDesktop ? "border-l border-gray-200 dark:border-neutral-800" : "pb-36"}`}
      >
        <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-neutral-800">
          <Text
            className="text-xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: AppFonts.heading }}
          >
            Carrito ({itemCount})
          </Text>
          {shortcutsHint}
        </View>

        {isDesktop ? (
          <ProductListContent
            searchContextId="ventas"
            listKey="desktop"
            searchInputRef={searchInputRef}
          />
        ) : (
          <CartPanel />
        )}
      </View>

      {!isDesktop && <FooterProducts />}

      <OnboardingHint />
    </AnimatedScreen>
  );
}
