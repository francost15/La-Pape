import LayoutSync from "@/components/LayoutSync";
import AddProductsSheet from "@/components/ventas/AddProductsSheet";
import VentaExitosaOverlay from "@/components/ventas/VentaExitosaOverlay";
import NativeToaster from "@/components/NativeToaster";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SkipLink } from "@/components/ui/SkipLink";
import { useTheme } from "@/hooks/useTheme";
import { logger } from "@/lib/utils/logger";
import { initSessionListener } from "@/store/session-store";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
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
    if (args[0] === "props.pointerEvents is deprecated. Use style.pointerEvents") return;
    warn(...args);
  };
}

export default function RootLayout() {
  const { isDark } = useTheme();

  useEffect(() => {
    const unsub = initSessionListener();
    return () => unsub();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.title = "Punto de Venta La Pape";
    if (!document.querySelector('meta[name="description"]')) {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Sistema punto de venta multi-sucursal para negocios en Chile. Gestión de productos, ventas, inventario y reportes en tiempo real.";
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <ErrorBoundary
        onError={(error, info) => {
          logger.error("Layout error", { error: error.message, stack: info.componentStack });
        }}
      >
        <SkipLink targetId="main-content">Saltar al contenido principal</SkipLink>
        <View className="flex-1" id="main-content">
          <LayoutSync />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="configuracion" />
          </Stack>
          <AddProductsSheet />
          <NativeToaster />
          <VentaExitosaOverlay />
        </View>
      </ErrorBoundary>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
