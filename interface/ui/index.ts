import type { ErrorInfo, ReactNode } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import type { IconSymbolName } from "@/interface/ui/icons";

export * from "./icons";
export type EmptyStateIcon = "cart" | "clock" | "search" | "products" | "error";

export interface EmptyStateProps {
  /** Ícono predefinido (uso habitual) */
  icon?: EmptyStateIcon;
  /** SF Symbol raw para casos que no están en el mapa predefinido */
  iconName?: IconSymbolName;
  title: string;
  description?: string;
  iconColor?: string;
}

// ── ConfirmAlert ──
export interface ConfirmAlertProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

// ── ErrorBoundary ──
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ── AnimatedScreen ──
export interface AnimatedScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

// ── Skeleton ──
export interface SkeletonProps {
  style?: ViewStyle;
  className?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
}

// ── CircleIconButton ──
export type CircleIconButtonVariant = "primary" | "secondary" | "success";

export interface CircleIconButtonProps {
  icon: IconSymbolName;
  variant?: CircleIconButtonVariant;
  onPress: () => void;
  size?: number;
  /** Cuando false, renderiza como View (solo visual) para usar dentro de otro Pressable */
  interactive?: boolean;
  accessibilityLabel?: string;
}
