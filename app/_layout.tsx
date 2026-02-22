import LayoutSync from "@/components/LayoutSync";
import AddProductsSheet from "@/components/ventas/AddProductsSheet";
import VentaExitosaOverlay from "@/components/ventas/VentaExitosaOverlay";
import NativeToaster from "@/components/NativeToaster";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initSessionListener } from "@/store/session-store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import "react-native-reanimated";
import "./global.css";

// Workaround: deprecación de pointerEvents en react-native-web (expo/expo#33248)
if (Platform.OS === "web" && typeof window !== "undefined") {
  const warn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (args[0] === "props.pointerEvents is deprecated. Use style.pointerEvents")
      return;
    warn(...args);
  };
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const unsub = initSessionListener();
    return () => unsub();
  }, []);

  if (Platform.OS === "web" && typeof document !== "undefined") {
    document.title = "La Pape - Sistema de Ventas";
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View className="flex-1">
        <LayoutSync />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <AddProductsSheet />
        <NativeToaster />
        <VentaExitosaOverlay />
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
