import type { LoginFormData } from "@/lib/validations/auth-schema";
import { AppFonts } from "@/constants/typography";
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

  const textColor = isDark ? "#d4d4d4" : "#000000";
  const placeholderColor = isDark ? "#a3a3a3" : "#6b7280";

  return (
    <View style={isWeb ? { width: "100%", maxWidth: 448, alignSelf: "center" } : { width: "100%", padding: 16, marginTop: 20 }}>
      <View style={{ marginBottom: 16 }}>
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
                backgroundColor: isDark ? "#262626" : "#fff",
                padding: 16,
                marginBottom: 16,
                borderRadius: 8,
                borderWidth: errors.email ? 1 : 0,
                borderColor: errors.email ? "#ef4444" : "transparent",
                color: textColor,
                fontSize: 16,
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
              color: "#ef4444",
              fontSize: 14,
              marginTop: 4,
              paddingHorizontal: 4,
              fontFamily: AppFonts.body,
            }}
          >
            {errors.email.message}
          </Text>
        )}
      </View>

      <View style={{ marginBottom: 16 }}>
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
                backgroundColor: isDark ? "#262626" : "#fff",
                padding: 16,
                marginBottom: 16,
                borderRadius: 8,
                borderWidth: errors.password ? 1 : 0,
                borderColor: errors.password ? "#ef4444" : "transparent",
                color: textColor,
                fontSize: 16,
                fontFamily: AppFonts.body,
              }}
              placeholderTextColor={placeholderColor}
            />
          )}
        />
        {errors.password && (
          <Text
            style={{
              color: "#ef4444",
              fontSize: 14,
              marginTop: 4,
              paddingHorizontal: 4,
              fontFamily: AppFonts.body,
            }}
          >
            {errors.password.message}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        style={{
          backgroundColor: "#ea580c",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 8,
          marginBottom: 8,
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
              fontWeight: "600",
              fontSize: 16,
              fontFamily: AppFonts.bodyStrong,
            }}
          >
            {isSignUp ? "Registrarse" : "Iniciar sesión"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleGooglePress}
        disabled={loading || googleLoading}
        style={{
          backgroundColor: isDark ? "#262626" : "#fff",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: isDark ? "#404040" : "#e5e7eb",
        }}
        accessibilityRole="button"
        accessibilityLabel={isSignUp ? "Registrarse con Google" : "Iniciar sesión con Google"}
      >
        {googleLoading ? (
          <ActivityIndicator size="small" color={isDark ? "#a3a3a3" : "#4b5563"} />
        ) : (
          <Image
            source={require("@/assets/images/google.webp")}
            style={{ width: 20, height: 20 }}
            contentFit="contain"
            accessibilityLabel="Logo de Google"
            accessibilityRole="image"
          />
        )}
        <Text
          style={{
            color: isDark ? "#d4d4d4" : "#374151",
            fontWeight: "600",
            fontSize: 16,
            fontFamily: AppFonts.bodyStrong,
          }}
        >
          {isSignUp ? "Registrarme con Google" : "Iniciar sesión con Google"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggleSignUp}
        style={{ marginTop: 8 }}
        accessibilityRole="button"
        accessibilityLabel={isSignUp ? "Cambiar a iniciar sesión" : "Cambiar a registro"}
      >
        <Text
          style={{
            color: "#ea580c",
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
