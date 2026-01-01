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
        //desaparecer el borde superior de la barra de tabs
        headerShown: false,
        //esto es para desaparecer el texto de las tabs
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopWidth: 0,
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
        name="explore"
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
