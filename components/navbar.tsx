import { Link } from "expo-router";
import { Platform, Text, View } from "react-native";

export default function Navbar() {
    // constante de si es web
  const isWeb = Platform.OS === 'web';

  return (
    <View className={`${isWeb ? 'web-navbar' : 'mobile-navbar'} flex-row justify-between items-center bg-gray-100 dark:bg-neutral-800 px-4 py-3 ${isWeb ? '' : 'pt-18'}`}>
      <Link href="/ventas" className={`${isWeb ? 'px-6 py-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors' : 'p-2'}`}>
        <Text className={`text-black dark:text-white font-bold ${isWeb ? 'text-2xl' : 'text-xl'}`}>La Pape</Text>
      </Link>
    {/* Si es web, mostrar las opciones de la navbar */}
      {/* {isWeb && (
        <View className="flex-row space-x-8">
          <Link href="/ventas" className="text-white hover:text-blue-200 px-4 rounded-lg transition-colors font-medium">
            <Text className="text-white hover:text-blue-200 font-medium text-lg">
                <IconSymbol size={28} name="cart.fill" color="white" />
                Ventas
            </Text>
          </Link>
          <Link href="/productos" className="text-white hover:text-blue-200 px-4 rounded-lg transition-colors font-medium">
            <Text className="text-white hover:text-blue-200 font-medium text-lg">
                <IconSymbol size={28} name="bag.fill" color="white" />
                Productos
            </Text>
          </Link>
          <Link href="/history" className="text-white hover:text-blue-200 px-4 rounded-lg transition-colors font-medium">
            <Text className="text-white hover:text-blue-200 font-medium text-lg">
                <IconSymbol size={28} name="clock.fill" color="white" />
                Historial
            </Text>
          </Link>
          <Link href="/summary" className="text-white hover:text-blue-200 px-4 rounded-lg transition-colors font-medium">
            <Text className="text-white hover:text-blue-200 font-medium text-lg">
                <IconSymbol size={28} name="doc.text" color="white" />
                Resumen
            </Text>
          </Link>
        </View>
      )} */}
    </View>
  );
}
