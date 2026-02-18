import { DynamicIslandTabBar } from '@/components/DynamicIslandTabBar';
import Navbar from '@/components/navbar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth } from '@/lib/firebase';
import { Tabs, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/');
      }
      setCheckingAuth(false);
    });

    return unsubscribe;
  }, [router]);

  if (checkingAuth) {
    return (
        <View className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
          <ActivityIndicator size="large" color="#ea580c" />
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
          tabBarActiveTintColor: '#c2410c',
          tabBarInactiveTintColor: '#78716c',
        }}
      >
      {/* Ventas */}
      <Tabs.Screen
        name="ventas"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="cart.fill" color={color} />
          ),
        }}
      />

      {/* Productos */}
      <Tabs.Screen
        name="productos"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="bag.fill" color={color} />
          ),
        }}
      />

      {/* Historial */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="clock.fill" color={color} />
          ),
        }}
      />

      {/* Resumen */}
      <Tabs.Screen
        name="resumen"
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={32} name="doc.text" color={color} />
          ),
        }}
      />
    </Tabs>
    </View>
  );
}
