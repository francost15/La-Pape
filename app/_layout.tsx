import NativeToaster from "@/components/NativeToaster";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
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

  if (Platform.OS === "web" && typeof document !== "undefined") {
    document.title = "La Pape - Sistema de Ventas";
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
      <NativeToaster />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
