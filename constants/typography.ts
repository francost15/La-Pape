import { Platform } from "react-native";

/**
 * Digital Atelier — Typography System
 *
 * Jerarquía:
 * - `display`: KPIs, precios grandes, titulares con impacto — Space Grotesk Bold
 * - `heading`: subtítulos, encabezados de sección — Space Grotesk SemiBold
 * - `body`: texto de lectura, descripciones — Inter Regular
 * - `bodyStrong`: botones, labels, énfasis — Inter Medium/SemiBold
 */
export const AppFonts = Platform.select({
  // En web las familias llegan por CSS (@import de Google Fonts en app/global.css),
  // por eso se usan los nombres CSS con fallbacks del sistema.
  web: {
    display: "'Space Grotesk', 'Inter', system-ui, sans-serif",
    heading: "'Space Grotesk', 'Inter', system-ui, sans-serif",
    body: "'Inter', 'Segoe UI', system-ui, sans-serif",
    bodyStrong: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  // En iOS/Android las fuentes se cargan con expo-font en app/_layout.tsx
  // (@expo-google-fonts); el nombre incluye el peso porque cada archivo es estático.
  default: {
    display: "SpaceGrotesk_700Bold",
    heading: "SpaceGrotesk_600SemiBold",
    body: "Inter_400Regular",
    bodyStrong: "Inter_500Medium",
  },
});
