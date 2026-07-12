import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { usePressScale } from "@/hooks/use-press-scale";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";

/**
 * Button — CTA canónico de la app.
 *
 * Reemplaza el patrón repetido `rounded-xl bg-orange-500 px-5 py-3.5` +
 * haptics + press-scale que hoy se hand-rollea en decenas de pantallas.
 *
 * - `primary`     naranja de marca, texto blanco (CTA principal)
 * - `secondary`   superficie + borde, texto principal (acción alternativa)
 * - `ghost`       transparente, texto naranja (acciones terciarias/links)
 * - `destructive` rojo semántico, texto blanco
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

interface SizeSpec {
  minHeight: number;
  paddingHorizontal: number;
  fontSize: number;
  borderRadius: number;
  /** hitSlop vertical para garantizar touch target ≥ 44 en botones chicos */
  hitSlopV: number;
}

const SIZES: Record<ButtonSize, SizeSpec> = {
  sm: { minHeight: 40, paddingHorizontal: 16, fontSize: 13, borderRadius: 12, hitSlopV: 4 },
  md: { minHeight: 48, paddingHorizontal: 20, fontSize: 15, borderRadius: 14, hitSlopV: 0 },
  lg: { minHeight: 56, paddingHorizontal: 24, fontSize: 16, borderRadius: 16, hitSlopV: 0 },
};

export interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Ocupa todo el ancho disponible (default true, como los CTA existentes) */
  fullWidth?: boolean;
  /** Icono opcional a la izquierda del texto */
  icon?: React.ReactNode;
  /** Desactiva el impacto háptico (activado por defecto en native) */
  haptics?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = true,
  icon,
  haptics = true,
  disabled,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  ...pressableProps
}: ButtonProps) {
  const { isDark, colors } = useThemeColors();
  const reduceMotion = useReducedMotion();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(reduceMotion);

  const isDisabled = !!disabled || loading;
  const sizeSpec = SIZES[size];

  // Naranja más claro en dark para mantener contraste sobre navy (mismo
  // criterio que --accent-primary en global.css).
  const accent = isDark ? AppColors.primaryLight : AppColors.primary;

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: accent },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
    },
    ghost: { backgroundColor: "transparent" },
    destructive: { backgroundColor: isDark ? AppColors.errorLight : AppColors.error },
  };

  const textColor: Record<ButtonVariant, string> = {
    primary: "#ffffff",
    secondary: colors.textPrimary,
    ghost: accent,
    destructive: "#ffffff",
  };

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (haptics && Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(event);
    },
    [haptics, onPress]
  );

  return (
    <Animated.View
      style={[fullWidth ? { width: "100%" } : { alignSelf: "flex-start" }, animatedStyle]}
    >
      <Pressable
        {...pressableProps}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        hitSlop={
          sizeSpec.hitSlopV > 0 ? { top: sizeSpec.hitSlopV, bottom: sizeSpec.hitSlopV } : undefined
        }
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }) => [
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: sizeSpec.minHeight,
            paddingHorizontal: sizeSpec.paddingHorizontal,
            borderRadius: sizeSpec.borderRadius,
            opacity: isDisabled ? 0.5 : 1,
          },
          variantStyles[variant],
          // Feedback extra en ghost/secondary, donde el scale solo no se nota
          pressed && !isDisabled && variant === "ghost"
            ? { backgroundColor: isDark ? AppColors.primaryGhostDark : AppColors.primaryGhost }
            : null,
          pressed && !isDisabled && variant === "secondary"
            ? { backgroundColor: colors.surfaceHover }
            : null,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor[variant]} />
        ) : (
          <>
            {icon}
            <Text
              style={[
                {
                  color: textColor[variant],
                  fontSize: sizeSpec.fontSize,
                  fontFamily: AppFonts.bodyStrong,
                  letterSpacing: -0.2,
                  ...(Platform.OS === "web" ? { fontWeight: "600" as const } : null),
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(Button);
