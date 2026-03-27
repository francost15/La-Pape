import { Platform } from "react-native";
import { AppColors } from "./colors";

/**
 * Digital Atelier — Design System
 *
 * Design tokens centralizados para toda la aplicación.
 * Principios: limpio, premium, sin cards anidadas.
 */
export const DesignSystem = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
  },

  shadows: {
    sm:
      Platform.OS === "web"
        ? "0 1px 2px rgba(0,0,0,0.04)"
        : ({
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1,
          } as const),
    md:
      Platform.OS === "web"
        ? "0 2px 8px rgba(0,0,0,0.06)"
        : ({
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          } as const),
    lg:
      Platform.OS === "web"
        ? "0 8px 24px rgba(0,0,0,0.08)"
        : ({
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 5,
          } as const),
    glow:
      Platform.OS === "web"
        ? "0 0 20px rgba(234,88,12,0.15)"
        : ({
            shadowColor: "#EA580C",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 4,
          } as const),
  },

  animations: {
    fast: 150,
    normal: 250,
    slow: 400,
    entrance: 500,
  },

  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    entrance: "cubic-bezier(0.0, 0, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  /** Navbar height tokens */
  navbar: {
    height: 56,
    heightCompact: 48,
  },
} as const;

/**
 * Component-level style tokens.
 * Cada componente usa estos tokens en lugar de valores ad-hoc.
 */
export const ComponentStyles = {
  card: {
    container: {
      borderRadius: DesignSystem.radius.xl,
      padding: DesignSystem.spacing.md,
    },
  },

  button: {
    primary: {
      backgroundColor: AppColors.primary,
      borderRadius: DesignSystem.radius.lg,
      paddingVertical: 14,
      paddingHorizontal: DesignSystem.spacing.lg,
    },
    secondary: {
      backgroundColor: "transparent",
      borderRadius: DesignSystem.radius.lg,
      borderWidth: 1.5,
      borderColor: AppColors.primary,
      paddingVertical: 14,
      paddingHorizontal: DesignSystem.spacing.lg,
    },
    ghost: {
      backgroundColor: "transparent",
      borderRadius: DesignSystem.radius.md,
      paddingVertical: 10,
      paddingHorizontal: DesignSystem.spacing.md,
    },
  },

  input: {
    container: {
      borderRadius: DesignSystem.radius.lg,
      borderWidth: 1.5,
      paddingVertical: 14,
      paddingHorizontal: DesignSystem.spacing.md,
    },
    focus: {
      borderColor: AppColors.primary,
      ringWidth: 3,
      ringColor: "rgba(234, 88, 12, 0.15)",
    },
  },

  /** Separator for list items */
  separator: {
    height: 1,
  },
} as const;

export type DesignSystemType = typeof DesignSystem;
export type ComponentStylesType = typeof ComponentStyles;
