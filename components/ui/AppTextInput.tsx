import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";
import React, { forwardRef, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

/**
 * AppTextInput — input de formulario canónico.
 *
 * Replica el look de los inputs existentes (AuthForm / formularios de
 * producto): superficie del tema, radio 14, borde 1.5 que cambia a naranja en
 * focus y a rojo con error. Pensado para React Hook Form: pasar
 * `error={errors.campo?.message}` directamente.
 */
export interface AppTextInputProps extends TextInputProps {
  /** Label visible encima del input */
  label?: string;
  /** Mensaje de error (RHF: `errors.campo?.message`). Pinta borde y texto en rojo. */
  error?: string;
  /** Texto de ayuda debajo del input (se oculta si hay error) */
  hint?: string;
  /** Estilo del contenedor externo (label + input + error) */
  containerStyle?: StyleProp<ViewStyle>;
}

const AppTextInput = forwardRef<TextInput, AppTextInputProps>(function AppTextInput(
  { label, error, hint, containerStyle, style, onFocus, onBlur, multiline, ...inputProps },
  ref
) {
  const { isDark, colors } = useThemeColors();
  const [focused, setFocused] = useState(false);

  const errorColor = isDark ? AppColors.errorLight : AppColors.error;
  const accent = isDark ? AppColors.primaryLight : AppColors.primary;

  const borderColor = error ? errorColor : focused ? accent : colors.borderStrong;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text
          style={{
            fontSize: 13,
            fontFamily: AppFonts.bodyStrong,
            color: colors.textSecondary,
            marginBottom: 6,
            ...(Platform.OS === "web" ? { fontWeight: "500" as const } : null),
          }}
        >
          {label}
        </Text>
      ) : null}

      <TextInput
        ref={ref}
        {...inputProps}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={
          inputProps.placeholderTextColor ??
          (isDark ? AppColors.dark.textMuted : AppColors.light.textSecondary)
        }
        accessibilityLabel={inputProps.accessibilityLabel ?? label ?? inputProps.placeholder}
        style={[
          {
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor,
            color: colors.textPrimary,
            fontSize: 15,
            fontFamily: AppFonts.body,
            minHeight: multiline ? 96 : 52,
            textAlignVertical: multiline ? "top" : "center",
          },
          style,
        ]}
      />

      {error ? (
        <Text
          style={{
            color: errorColor,
            fontSize: 13,
            marginTop: 6,
            paddingHorizontal: 4,
            fontFamily: AppFonts.body,
          }}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            marginTop: 6,
            paddingHorizontal: 4,
            fontFamily: AppFonts.body,
          }}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

export default AppTextInput;
