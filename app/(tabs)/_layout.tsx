import { DynamicIslandTabBar } from "@/components/DynamicIslandTabBar";
import Navbar from "@/components/navbar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { onProductosByNegocio } from "@/lib/services/productos";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
  const { ready } = useRequireAuth({ redirectUnauthenticatedTo: "/" });
  const negocioId = useSessionStore((s) => s.negocioId);

  useEffect(() => {
    if (!negocioId) return;
    return onProductosByNegocio(negocioId, (products) => {
      useProductosStore.getState().setProducts(products);
    });
  }, [negocioId]);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <Tabs
        tabBar={(props) => <DynamicIslandTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          // lazy + freezeOnBlur: las pantallas ocultas no se montan hasta visitarlas
          // ni se re-renderizan con los updates en tiempo real de Firestore,
          // que era lo que trababa el cambio de tab
          lazy: true,
          freezeOnBlur: true,
          tabBarShowLabel: true,
          tabBarActiveTintColor: AppColors.primary,
          tabBarInactiveTintColor: AppColors.light.textMuted,
        }}
      >
        <Tabs.Screen
          name="ventas"
          options={{
            title: "Ventas",
            tabBarIcon: ({ color }) => <IconSymbol size={32} name="cart.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="productos"
          options={{
            title: "Productos",
            tabBarIcon: ({ color }) => <IconSymbol size={32} name="bag.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "Historial",
            tabBarIcon: ({ color }) => <IconSymbol size={32} name="clock.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="resumen"
          options={{
            title: "Resumen",
            tabBarIcon: ({ color }) => <IconSymbol size={32} name="doc.text" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
