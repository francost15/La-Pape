import { useColorScheme } from "@/hooks/use-color-scheme";
import { handleSignIn, handleSignUp } from "@/lib";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isWeb = Platform.OS === 'web';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onSignIn = async () => {
        setError('');
        const errorMessage = await handleSignIn(email, password, router);
        if (errorMessage) {
            setError(errorMessage);
        }
    }

    const onSignUp = async () => {
        setError('');
        const errorMessage = await handleSignUp(email, password, router);
        if (errorMessage) {
            setError(errorMessage);
        }
    }

    return (
        <SafeAreaView className={`flex-1 justify-center bg-gray-100 dark:bg-neutral-900 ${isWeb ? 'px-6' : 'items-center'}`}>
            <View className={`space-y-4 ${isWeb ? 'w-full max-w-md mx-auto' : 'p-4'}`}>
                <TextInput 
                    placeholder="Email" 
                    value={email} 
                    onChangeText={setEmail}
                    className="bg-white mb-4 dark:bg-neutral-800 p-4 rounded-lg"
                    style={{ color: isDark ? '#d4d4d4' : '#000000' }}
                    placeholderTextColor={isDark ? '#a3a3a3' : '#6b7280'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput 
                    placeholder="Password" 
                    value={password} 
                    onChangeText={setPassword}
                    secureTextEntry
                    className="bg-white mb-4 dark:bg-neutral-800 p-4 rounded-lg"
                    style={{ color: isDark ? '#d4d4d4' : '#000000' }}
                    placeholderTextColor={isDark ? '#a3a3a3' : '#6b7280'}
                />
                {/* Mostrar error */}
                {error && (
                    <Text className="text-red-500 text-sm mb-2 px-1">{error}</Text>
                )}
                {/* Inicio y Registro */}
                 <TouchableOpacity 
                    onPress={onSignIn} 
                    className="bg-orange-600 mb-4 px-4 py-3 rounded-lg"
                >
                    <Text className="text-white text-center font-medium text-base">Iniciar sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={onSignUp} 
                    className="bg-orange-600 mb-4 px-4 py-3 rounded-lg"
                >
                    <Text className="text-white text-center font-medium text-base">Registrarse</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}