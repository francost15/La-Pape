import { DynamicIslandTabBar } from "@/components/DynamicIslandTabBar";
import Navbar from "@/components/navbar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
  const { ready } = useRequireAuth({ redirectUnauthenticatedTo: "/" });

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAF9] dark:bg-[#0C0F14]">
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
