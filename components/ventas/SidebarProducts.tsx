import ProductListContent from "@/components/ventas/ProductListContent";
import React from "react";
import { View } from "react-native";

/**
 * Vista de productos para escritorio: sidebar fijo a la izquierda
 * con búsqueda, categorías y lista de productos.
 */
export default function SidebarProducts() {
  return (
    <View className="flex-3 border-r border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900/50">
      <View className="flex-1 mt-3 min-h-0">
        <ProductListContent searchContextId="ventas" listKey="desktop" />
      </View>
    </View>
  );
}
