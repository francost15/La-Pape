/**
 * Digital Atelier — Design System
 *
 * Design tokens centralizados para toda la aplicación.
 * Principios: limpio, premium, sin cards anidadas.
 */
export const DesignSystem = {
  radius: {
    xxl: 28,
  },

  animations: {
    fast: 150,
    normal: 250,
  },

  /** Coeficientes bezier para Easing.bezier() de Reanimated */
  easingCurve: {
    strongOut: [0.23, 1, 0.32, 1] as const,
  },
} as const;

/** Ancho mínimo para considerar layout de escritorio */
export const DESKTOP_MIN_WIDTH = 768;

export type DesignSystemType = typeof DesignSystem;
