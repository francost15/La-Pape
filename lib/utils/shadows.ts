import { Platform } from "react-native";

/**
 * Sombra multiplataforma.
 *
 * RN Web soporta `boxShadow` (CSS) pero ignora `elevation`; Android usa
 * `elevation` e ignora `boxShadow`. Antes se repetía el ternario
 * `Platform.OS === "web" ? { boxShadow } : { elevation }` en 25+ archivos:
 * este helper es la única fuente de verdad.
 */
export function shadow(webBoxShadow: string, elevation: number) {
  return Platform.OS === "web" ? { boxShadow: webBoxShadow } : { elevation };
}

/**
 * Presets para las combinaciones recurrentes. Los valores replican
 * exactamente los que ya estaban inline para no cambiar el aspecto visual.
 */
export const shadows = {
  /** Card elevada del detalle de producto (precio/stock). */
  card: shadow("0 12px 24px rgba(0,0,0,0.04)", 4),
  /** Card sutil de listado (p. ej. VentaCard). */
  subtle: shadow("0 4px 12px rgba(0,0,0,0.02)", 2),
} as const;
