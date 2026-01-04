import { useColorScheme } from "@/hooks/use-color-scheme";
import { handleSignIn, handleSignUp } from "@/lib";
import { loginSchema, LoginFormData } from "@/lib/validations/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isWeb = Platform.OS === 'web';
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoading(true);
            const errorMessage = isSignUp
                ? await handleSignUp(data.email, data.password, router)
                : await handleSignIn(data.email, data.password, router);
            
            if (errorMessage) {
                // El error se mostrará a través de los errores del formulario
                return;
            }
            reset();
        } catch (error: any) {
            console.error('Error en autenticación:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className={`flex-1 justify-center bg-gray-100 dark:bg-neutral-900 ${isWeb ? 'px-6' : 'items-center'}`}>
            <View className={`space-y-4 ${isWeb ? 'w-full max-w-md mx-auto' : 'w-full p-4'}`}>
                <Text className="text-2xl font-bold text-black dark:text-white mb-6 text-center">
                    {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </Text>

                {/* Email */}
                <View className="mb-4">
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
                                    errors.email ? 'border-red-500' : 'border-transparent'
                                }`}
                                style={{ color: isDark ? '#d4d4d4' : '#000000' }}
                                placeholderTextColor={isDark ? '#a3a3a3' : '#6b7280'}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                        )}
                    />
                    {errors.email && (
                        <Text className="text-red-500 text-sm mt-1 px-1">{errors.email.message}</Text>
                    )}
                </View>

                {/* Password */}
                <View className="mb-4">
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
                                    errors.password ? 'border-red-500' : 'border-transparent'
                                }`}
                                style={{ color: isDark ? '#d4d4d4' : '#000000' }}
                                placeholderTextColor={isDark ? '#a3a3a3' : '#6b7280'}
                                autoComplete="password"
                            />
                        )}
                    />
                    {errors.password && (
                        <Text className="text-red-500 text-sm mt-1 px-1">{errors.password.message}</Text>
                    )}
                </View>

                {/* Botón principal */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className="bg-orange-600 mb-3 px-4 py-3 rounded-lg"
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-medium text-base">
                            {isSignUp ? 'Registrarse' : 'Iniciar sesión'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Toggle entre Sign In y Sign Up */}
                <TouchableOpacity
                    onPress={() => {
                        setIsSignUp(!isSignUp);
                        reset();
                    }}
                    className="mb-4"
                >
                    <Text className="text-center text-orange-600 text-sm">
                        {isSignUp 
                            ? '¿Ya tienes cuenta? Inicia sesión' 
                            : '¿No tienes cuenta? Regístrate'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}