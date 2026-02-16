import CartPanel from "@/components/ventas/CartPanel";
import FooterProducts from "@/components/ventas/FooterProducts";
import SidebarProducts from "@/components/ventas/SidebarProducts";
import { useVentasStore } from "@/store/ventas-store";
import { Text, useWindowDimensions, View } from "react-native";

const DESKTOP_MIN_WIDTH = 768;

export default function VentasScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const itemCount = useVentasStore((s) => s.getItemCount());

  return (
    <View className="flex-1 flex-row bg-white dark:bg-neutral-900">
      {isDesktop && <SidebarProducts />}

      <View
        className={`flex-1 ${isDesktop ? "border-l border-gray-200 dark:border-neutral-800" : "pb-28"}`}
      >
        <View className="px-4 py-4 border-b border-gray-200 dark:border-neutral-800">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Carrito ({itemCount})
          </Text>
        </View>

        <CartPanel />
      </View>

      {!isDesktop && <FooterProducts />}
    </View>
  );
}
