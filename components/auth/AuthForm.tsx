import AppTextInput from "@/components/ui/AppTextInput";
import Button from "@/components/ui/Button";
import type { AuthFormProps } from "@/interface/session";
import { Image } from "expo-image";
import * as React from "react";
import { Controller } from "react-hook-form";
import { View } from "react-native";

export default function AuthForm({
  control,
  errors,
  handleSubmit,
  onSubmit,
  onGooglePress,
  loading,
  isSignUp,
  onToggleSignUp,
}: AuthFormProps) {
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGooglePress = async () => {
    setGoogleLoading(true);
    try {
      await onGooglePress();
    } catch (error) {
      setGoogleLoading(false);
      throw error;
    }
    setGoogleLoading(false);
  };

  const submitLabel = isSignUp ? "Registrarse" : "Iniciar Sesión";
  const googleLabel = isSignUp ? "Registrarme con Google" : "Iniciar con Google";
  const toggleLabel = isSignUp
    ? "¿Ya tienes cuenta? Inicia sesión"
    : "¿No tienes cuenta? Regístrate";

  return (
    <View className="w-full">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppTextInput
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            containerStyle={{ marginBottom: 12 }}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AppTextInput
            placeholder="Contraseña"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            containerStyle={{ marginBottom: 20 }}
          />
        )}
      />

      <Button
        title={submitLabel}
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        disabled={googleLoading}
        style={{ marginBottom: 10 }}
      />

      <Button
        title={googleLabel}
        variant="secondary"
        onPress={handleGooglePress}
        loading={googleLoading}
        disabled={loading}
        icon={
          <Image
            source={require("@/assets/images/google.webp")}
            style={{ width: 18, height: 18 }}
            contentFit="contain"
            accessibilityLabel="Logo de Google"
            accessibilityRole="image"
          />
        }
        style={{ marginBottom: 10 }}
      />

      <Button
        title={toggleLabel}
        variant="ghost"
        size="sm"
        fullWidth
        haptics={false}
        onPress={onToggleSignUp}
        style={{ marginTop: 12 }}
        accessibilityLabel={isSignUp ? "Cambiar a iniciar sesión" : "Cambiar a registro"}
      />
    </View>
  );
}
