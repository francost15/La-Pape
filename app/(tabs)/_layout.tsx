import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs  
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, // esto es para mostrar el texto de las tabs
        tabBarActiveTintColor: '#ea580c', // orange-600 de Tailwind
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault, // esto es para el color de las tabs inactivas
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background, // esto es para el color de fondo de las tabs
          borderTopWidth: 0, // esto es para desaparecer el borde superior de las tabs
        },
      }}>
      {/* Asi se llaman las carpetas de las tabs carpeta/index.tsx */}
      <Tabs.Screen
        name="ventas/index"
        options={{
          title: 'Ventas',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="cart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="productos/index"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="bag.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Resumen',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="doc.text" color={color} />,
        }}
      />

    </Tabs>
  );
}
