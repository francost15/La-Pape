import AuthForm from "@/components/auth/AuthForm";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { signIn, signUp } from "@/lib/auth";
import {
  getGoogleRedirectResult,
  signInWithGoogle,
} from "@/lib/authWithGoogle";
import { auth } from "@/lib/firebase";
import { LoginFormData, loginSchema } from "@/lib/validations/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, View } from "react-native";
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
   * Redirección cuando ya hay sesión o cuando vuelve de Google redirect (web).
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !navigatingRef.current) {
        navigatingRef.current = true;
        router.replace("/ventas");
      }
    });

    if (isWeb) {
      getGoogleRedirectResult()
        .then((result) => {
          if (result?.user && !navigatingRef.current) {
            navigatingRef.current = true;
            router.replace("/ventas");
          }
        })
        .catch(() => {});
    }

    return unsubscribe;
  }, [isWeb]);

  /**
   * Submit Login / Register
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
    } catch (error: unknown) {
      setError("email", {
        type: "manual",
        message: error instanceof Error ? error.message : "Error de autenticación",
      });
    } finally {
      setLoading(false);
    }
  };

  const onGooglePress = async () => {
    try {
      const result = await signInWithGoogle();
      if (result) {
        navigatingRef.current = true;
        router.replace("/ventas");
      }
    } catch (error: unknown) {
      setError("email", {
        type: "manual",
        message: error instanceof Error ? error.message : "Error con Google",
      });
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
          isWeb ? "w-full max-w-md mx-auto" : "w-full p-4 mt-20"
        }`}
      >
        <Image
          source={require("@/assets/images/pape.png")}
          style={{
            width: 250,
            height: 150,
            alignSelf: "center",
          }}
        />
        <AuthForm
          control={control}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          onGooglePress={onGooglePress}
          loading={loading}
          isSignUp={isSignUp}
          onToggleSignUp={() => {
            setIsSignUp(!isSignUp);
            reset();
          }}
          isDark={isDark}
          isWeb={isWeb}
        />
      </View>
    </SafeAreaView>
  );
}
