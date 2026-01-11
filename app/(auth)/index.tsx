import { useColorScheme } from "@/hooks/use-color-scheme";
import { signIn, signUp } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { LoginFormData, loginSchema } from "@/lib/validations/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isWeb = Platform.OS === "web";

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Evita navegación doble
  const navigatingRef = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * 🔐 Redirección solo para sesión ya iniciada
   * (ej. usuario vuelve a abrir la app)
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !navigatingRef.current) {
        navigatingRef.current = true;
        router.replace("/ventas");
      }
    });

    return unsubscribe;
  }, []);

  /**
   * 📤 Submit Login / Register
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);

      if (isSignUp) {
        await signUp(data.email, data.password);
      } else {
        await signIn(data.email, data.password);
      }

      navigatingRef.current = true;
      router.replace("/ventas");
      reset();
    } catch (error: any) {
      setError("email", {
        type: "manual",
        message: error.message ?? "Error de autenticación",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 justify-center bg-gray-100 dark:bg-neutral-900 ${
        isWeb ? "px-6" : "items-center"
      }`}
    >
      <View
        className={`space-y-4 ${
          isWeb ? "w-full max-w-md mx-auto" : "w-full p-4"
        }`}
      >
        <Text className="text-2xl font-bold text-black dark:text-white mb-6 text-center">
          {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
        </Text>

        {/* EMAIL */}
        <View>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                className={`bg-white dark:bg-neutral-800 p-4 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-transparent"
                }`}
                style={{ color: isDark ? "#d4d4d4" : "#000000" }}
                placeholderTextColor={isDark ? "#a3a3a3" : "#6b7280"}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-sm mt-1 px-1">
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* PASSWORD */}
        <View>
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
                className={`bg-white dark:bg-neutral-800 p-4 rounded-lg border ${
                  errors.password ? "border-red-500" : "border-transparent"
                }`}
                style={{ color: isDark ? "#d4d4d4" : "#000000" }}
                placeholderTextColor={isDark ? "#a3a3a3" : "#6b7280"}
              />
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-sm mt-1 px-1">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="bg-orange-600 px-4 py-3 rounded-lg mt-2"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-medium text-base">
              {isSignUp ? "Registrarse" : "Iniciar sesión"}
            </Text>
          )}
        </TouchableOpacity>

        {/* TOGGLE */}
        <TouchableOpacity
          onPress={() => {
            setIsSignUp(!isSignUp);
            reset();
          }}
        >
          <Text className="text-center text-orange-600 text-sm mt-2">
            {isSignUp
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
