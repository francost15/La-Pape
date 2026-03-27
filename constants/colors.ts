/**
 * Digital Atelier — Color Palette
 *
 * Navy dark mode + warm orange accent.
 * Light mode uses stone/neutral tones for a premium editorial feel.
 */
export const AppColors = {
  primary: "#ea580c",
  primaryLight: "#f97316",
  primaryDark: "#c2410c",
  primaryGhost: "rgba(234, 88, 12, 0.08)",
  primaryGhostDark: "rgba(249, 115, 22, 0.12)",

  success: "#16a34a",
  successLight: "#22c55e",
  warning: "#eab308",
  error: "#dc2626",
  errorLight: "#ef4444",
  info: "#2563eb",
  infoLight: "#3b82f6",

  light: {
    canvas: "#FAFAF9",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    surfaceHover: "#F5F5F4",
    border: "rgba(0,0,0,0.06)",
    borderStrong: "rgba(0,0,0,0.12)",
    textPrimary: "#1A1A1A",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
  },

  dark: {
    canvas: "#0C0F14",
    surface: "#141820",
    surfaceElevated: "#1A1F2B",
    surfaceHover: "#1E2433",
    border: "rgba(255,255,255,0.06)",
    borderStrong: "rgba(255,255,255,0.12)",
    textPrimary: "#F0F0F0",
    textSecondary: "#8B95A5",
    textMuted: "#5A6478",
  },
} as const;
