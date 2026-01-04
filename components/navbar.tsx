import { auth } from "@/lib/firebase";
import { Link, router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export default function Navbar() {
    // constante de si es web
  const isWeb = Platform.OS === 'web';
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View className={`${isWeb ? 'web-navbar' : 'mobile-navbar'} flex-row justify-between items-center bg-gray-100 dark:bg-neutral-800 px-4 py-3 ${isWeb ? '' : 'pt-18'}`}>
      <Link href="/ventas" className={`${isWeb ? 'px-6 py-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors' : 'p-2'}`}>
        <Text className={`text-black dark:text-white font-bold ${isWeb ? 'text-2xl' : 'text-xl'}`}>La Pape</Text>
      </Link>

      {isAuthenticated && (
        <TouchableOpacity
          onPress={handleSignOut}
          className={`${isWeb ? 'px-4 py-2 hover:bg-gray-200 dark:hover:bg-neutral-500 rounded-lg transition-colors' : 'px-3 py-2'} bg-gray-200 dark:bg-neutral-700 rounded-lg`}
        >
          <Text className={`text-black dark:text-white font-semibold ${isWeb ? 'text-base' : 'text-sm'}`}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
