import type { Theme, ThemeState } from "@/interface/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Aplica la preferencia al `Appearance` de React Native, que es la ÚNICA fuente
 * de verdad del tema: tanto las variantes `dark:` de NativeWind como
 * `useThemeColors` leen de `useColorScheme()`, así que al fijar Appearance todo
 * el árbol queda consistente sin sistemas de tema paralelos.
 * `"unspecified"` = seguir el tema del sistema operativo.
 */
function applyTheme(theme: Theme) {
  Appearance.setColorScheme(theme === "system" ? "unspecified" : theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: "theme-preference",
      // AsyncStorage funciona en nativo y web (el default de zustand era
      // localStorage, que no existe en iOS/Android y rompía la persistencia).
      storage: createJSONStorage(() => AsyncStorage),
      // Reaplica la preferencia guardada al arrancar la app.
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
