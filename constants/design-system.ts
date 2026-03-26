import { Platform } from "react-native";

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
    xl: 24,
    full: 9999,
  },

  shadows: {
    sm:
      Platform.OS === "web"
        ? "0 1px 2px rgba(0,0,0,0.05)"
        : ({
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          } as const),
    md:
      Platform.OS === "web"
        ? "0 4px 6px rgba(0,0,0,0.07)"
        : ({
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 6,
            elevation: 3,
          } as const),
    lg:
      Platform.OS === "web"
        ? "0 10px 15px rgba(0,0,0,0.1)"
        : ({
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          } as const),
  },

  animations: {
    fast: 150,
    normal: 250,
    slow: 400,
  },

  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

export const ComponentStyles = {
  card: {
    container: {
      borderRadius: DesignSystem.radius.lg,
      backgroundColor: "white",
      padding: DesignSystem.spacing.md,
      ...(Platform.OS === "web"
        ? { boxShadow: DesignSystem.shadows.md as string }
        : (DesignSystem.shadows.md as object)),
    },
  },

  button: {
    primary: {
      backgroundColor: "#ea580c",
      borderRadius: DesignSystem.radius.md,
      paddingVertical: DesignSystem.spacing.sm + 4,
      paddingHorizontal: DesignSystem.spacing.md,
    },
    secondary: {
      backgroundColor: "transparent",
      borderRadius: DesignSystem.radius.md,
      borderWidth: 1,
      borderColor: "#ea580c",
      paddingVertical: DesignSystem.spacing.sm + 4,
      paddingHorizontal: DesignSystem.spacing.md,
    },
  },

  input: {
    container: {
      borderRadius: DesignSystem.radius.md,
      borderWidth: 1,
      borderColor: "#e5e7eb",
      paddingVertical: DesignSystem.spacing.sm + 4,
      paddingHorizontal: DesignSystem.spacing.md,
    },
    focus: {
      borderColor: "#ea580c",
      ringWidth: 2,
      ringColor: "rgba(234, 88, 12, 0.2)",
    },
  },
} as const;

export type DesignSystemType = typeof DesignSystem;
export type ComponentStylesType = typeof ComponentStyles;
