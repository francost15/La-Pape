import type { Config } from "tailwindcss";

/**
 * Design tokens semánticos — Digital Atelier.
 *
 * Los colores apuntan a las CSS variables definidas en `app/global.css`
 * (que ya tienen valores para light Y dark vía `prefers-color-scheme`),
 * así que las clases de token NO necesitan variante `dark:`:
 *
 *   <View className="bg-surface border-line">
 *     <Text className="text-content-primary">…</Text>
 *   </View>
 *
 * `app/global.css` carga este archivo con `@config`. Las clases de token
 * (`text-content-primary`, `bg-accent`, …) no llevan variante `dark:`:
 * las variables cambian con la media query y, en web, con la clase
 * `light`/`dark` de `<html>`.
 */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Superficies ────────────────────────────────────────────────
        canvas: "var(--bg-canvas)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          elevated: "var(--bg-surface-elevated)",
          hover: "var(--bg-surface-hover)",
        },

        // ── Bordes (clases: border-line, border-line-strong) ──────────
        line: {
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
        },

        // ── Texto (clases: text-content-primary, etc.) ────────────────
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          // No existe --text-label: en AppColors, textLabel === textSecondary
          // en ambos temas (es el muted que sí cumple WCAG AA).
          label: "var(--text-secondary)",
        },

        // ── Acento (naranja de marca) ──────────────────────────────────
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
          // Fondo fantasma para chips/hover del acento
          soft: "var(--accent-primary-light)",
        },

        // ── Semánticos ─────────────────────────────────────────────────
        success: "var(--accent-success)",
        error: "var(--accent-danger)",
        info: "var(--accent-info)",
        // global.css no define var para warning; valor de AppColors.warning.
        // En dark usar `dark:text-yellow-400` si se necesita más contraste.
        warning: "#eab308",
      },

      // Familias alineadas con AppFonts (constants/typography.ts).
      // En native el peso va en el nombre del archivo (expo-google-fonts),
      // por eso font-display/font-heading difieren aunque la familia CSS
      // en web sea la misma (Space Grotesk).
      fontFamily: {
        display: ["SpaceGrotesk_700Bold", "Space Grotesk", "Inter", "system-ui", "sans-serif"],
        heading: ["SpaceGrotesk_600SemiBold", "Space Grotesk", "Inter", "system-ui", "sans-serif"],
        body: ["Inter_400Regular", "Inter", "Segoe UI", "system-ui", "sans-serif"],
        "body-strong": ["Inter_500Medium", "Inter", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
} satisfies Config;
