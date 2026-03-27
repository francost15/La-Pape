import type { LoginFormData } from "@/lib/validations/auth-schema";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { Image } from "expo-image";
import * as React from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
} from "react-hook-form";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface AuthFormProps {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  handleSubmit: UseFormHandleSubmit<LoginFormData>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  onGooglePress: () => Promise<void>;
  loading: boolean;
  isSignUp: boolean;
  onToggleSignUp: () => void;
  isDark?: boolean;
  isWeb?: boolean;
}

export default function AuthForm({
  control,
  errors,
  handleSubmit,
  onSubmit,
  onGooglePress,
  loading,
  isSignUp,
  onToggleSignUp,
  isDark = false,
  isWeb = false,
}: AuthFormProps) {
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGooglePress = async () => {
    try {
      setGoogleLoading(true);
      await onGooglePress();
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputBg = isDark ? AppColors.dark.surface : "#FFFFFF";
  const inputBorder = isDark ? AppColors.dark.border : "rgba(0,0,0,0.08)";
  const textColor = isDark ? AppColors.dark.textPrimary : AppColors.light.textPrimary;
  const placeholderColor = isDark ? AppColors.dark.textMuted : AppColors.light.textSecondary;

  return (
    <View style={isWeb ? { width: "100%", maxWidth: 420, alignSelf: "center" } : { width: "100%" }}>
      {/* Email */}
      <View style={{ marginBottom: 12 }}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              style={{
                backgroundColor: inputBg,
                padding: 16,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: errors.email ? AppColors.error : inputBorder,
                color: textColor,
                fontSize: 15,
                fontFamily: AppFonts.body,
              }}
              placeholderTextColor={placeholderColor}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          )}
        />
        {errors.email && (
          <Text
            style={{
              color: AppColors.error,
              fontSize: 13,
              marginTop: 6,
              paddingHorizontal: 4,
              fontFamily: AppFonts.body,
            }}
          >
            {errors.email.message}
          </Text>
        )}
      </View>

      {/* Password */}
      <View style={{ marginBottom: 20 }}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              style={{
                backgroundColor: inputBg,
                padding: 16,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: errors.password ? AppColors.error : inputBorder,
                color: textColor,
                fontSize: 15,
                fontFamily: AppFonts.body,
              }}
              placeholderTextColor={placeholderColor}
            />
          )}
        />
        {errors.password && (
          <Text
            style={{
              color: AppColors.error,
              fontSize: 13,
              marginTop: 6,
              paddingHorizontal: 4,
              fontFamily: AppFonts.body,
            }}
          >
            {errors.password.message}
          </Text>
        )}
      </View>

      {/* Primary submit */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        style={{
          backgroundColor: AppColors.primary,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderRadius: 14,
          marginBottom: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
        accessibilityRole="button"
        accessibilityLabel={isSignUp ? "Registrarse" : "Iniciar sesión"}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 15,
              fontFamily: AppFonts.bodyStrong,
              letterSpacing: -0.2,
            }}
          >
            {isSignUp ? "Registrarse" : "Iniciar Sesión"}
          </Text>
        )}
      </TouchableOpacity>

      {/* Google sign in */}
      <TouchableOpacity
        onPress={handleGooglePress}
        disabled={loading || googleLoading}
        style={{
          backgroundColor: inputBg,
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderRadius: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 10,
          borderWidth: 1.5,
          borderColor: inputBorder,
        }}
        accessibilityRole="button"
        accessibilityLabel={isSignUp ? "Registrarse con Google" : "Iniciar sesión con Google"}
      >
        {googleLoading ? (
          <ActivityIndicator size="small" color={placeholderColor} />
        ) : (
          <Image
            source={require("@/assets/images/google.webp")}
            style={{ width: 18, height: 18 }}
            contentFit="contain"
            accessibilityLabel="Logo de Google"
            accessibilityRole="image"
          />
        )}
        <Text
          style={{
            color: textColor,
            fontWeight: "600",
            fontSize: 15,
            fontFamily: AppFonts.bodyStrong,
          }}
        >
          {isSignUp ? "Registrarme con Google" : "Iniciar con Google"}
        </Text>
      </TouchableOpacity>

      {/* Toggle signup */}
      <TouchableOpacity
        onPress={onToggleSignUp}
        style={{ marginTop: 12, paddingVertical: 8 }}
        accessibilityRole="button"
        accessibilityLabel={isSignUp ? "Cambiar a iniciar sesión" : "Cambiar a registro"}
      >
        <Text
          style={{
            color: AppColors.primary,
            fontSize: 14,
            textAlign: "center",
            fontFamily: AppFonts.body,
          }}
        >
          {isSignUp
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
