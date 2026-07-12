import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from "@expo-google-fonts/space-grotesk";
import { type FontSource, useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import LayoutSync from "@/components/LayoutSync";
import NativeToaster from "@/components/NativeToaster";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SkipLink } from "@/components/ui/SkipLink";
import AddProductsSheet from "@/components/ventas/AddProductsSheet";
import VentaExitosaOverlay from "@/components/ventas/VentaExitosaOverlay";
import { useTheme } from "@/hooks/useTheme";
import { logger } from "@/lib/utils/logger";
import { initSessionListener } from "@/store/session-store";
import { useVentasStore } from "@/store/ventas-store";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import "react-native-reanimated";
import "./global.css";

// Mantener el splash nativo visible hasta que las fuentes de marca estén listas,
// para evitar un flash de Avenir/Roboto antes de Space Grotesk/Inter.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ya estaba oculto o no disponible (web): no es un error.
});

// En web las fuentes llegan vía @import de Google Fonts en global.css;
// no descargamos los archivos de nuevo con expo-font.
const BRAND_FONTS: Record<string, FontSource> =
  Platform.OS === "web"
    ? {}
    : {
        SpaceGrotesk_600SemiBold,
        SpaceGrotesk_700Bold,
        Inter_400Regular,
        Inter_500Medium,
      };

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
  // fontError: si la carga falla (p. ej. sin red en el primer arranque), seguimos
  // con las fuentes del sistema en vez de dejar la app bloqueada en el splash.
  const [fontsLoaded, fontError] = useFonts(BRAND_FONTS);
  const fontsReady = fontsLoaded || fontError != null;

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync().catch(() => {
        // Puede fallar si el splash ya fue ocultado; ignorar.
      });
    }
  }, [fontsReady]);

  useEffect(() => {
    const unsub = initSessionListener();
    return () => unsub();
  }, []);

  useEffect(() => {
    useVentasStore.getState().clearCart();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.title = "Punto de Venta La Pape";
    if (!document.querySelector('meta[name="description"]')) {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Sistema punto de venta. Gestión de productos, ventas, inventario y reportes en tiempo real.";
      document.head.appendChild(meta);
    }
  }, []);

  // El splash nativo sigue visible mientras devolvemos null, así que no hay pantalla en blanco.
  // La sesión (useSessionStore.ready) se resuelve en (auth)/(tabs); este gate solo cubre fuentes.
  if (!fontsReady) return null;

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
