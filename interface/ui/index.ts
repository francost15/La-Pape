import type { Control, FieldPath, FieldValues } from "react-hook-form";
import type { ErrorInfo, ReactNode } from "react";
import type {
  DimensionValue,
  PressableProps,
  StyleProp,
  TextInputProps,
  TextProps,
  TextStyle,
  ViewStyle,
} from "react-native";
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

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  haptics?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export type AppTextVariant =
  | "display"
  | "heading"
  | "subheading"
  | "body"
  | "bodyStrong"
  | "label"
  | "eyebrow"
  | "caption";

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  color?: string;
}

export interface AppTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export interface ThumbProps {
  uri?: string | null;
  size?: number;
  borderRadius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  recyclingKey?: string;
  iconName?: IconSymbolName;
  iconSize?: number;
  iconColor?: string;
  fallback?: ReactNode;
}

export interface UserAvatarProps {
  name?: string | null;
  photoUri?: string | null;
  size?: number;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
}

export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: number;
  closeLabel?: string;
}

export interface CenteredModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: number;
  closeLabel?: string;
}

export interface ProductCardSkeletonProps {
  variant?: "row" | "card";
}

export interface ProductListSkeletonProps {
  numColumns?: number;
  count?: number;
}

export interface HistoryListSkeletonProps {
  groups?: number;
  cardsPerGroup?: number;
}

export interface DetailSkeletonProps {
  variant?: "detail" | "form";
}

export interface ResumenSkeletonProps {
  isMobile: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: SelectOption[];
  placeholder: string;
  error?: string;
}

export interface CircleIconButtonProps {
  icon: IconSymbolName;
  variant?: CircleIconButtonVariant;
  onPress: () => void;
  size?: number;
  /** Cuando false, renderiza como View (solo visual) para usar dentro de otro Pressable */
  interactive?: boolean;
  accessibilityLabel?: string;
}
