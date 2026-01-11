import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function VentasScreen() {
  return (
    <View className="flex-1 flex-row bg-white dark:bg-neutral-900">
      {/* ================= PRODUCTOS ================= */}
      <View className="flex-4 bg-white dark:bg-neutral-900">
        {/* Aquí va el contenido de productos */}
      </View>

      {/* ================= CARRITO ================= */}
      <View className="flex-1 border-l border-gray-200 dark:border-neutral-800">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="bg-white dark:bg-neutral-900"
        >
          {/* Header */}
          <View className="px-4 py-5 border-b border-gray-200 dark:border-neutral-800">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl font-bold text-black dark:text-white">
                Carrito (0)
              </Text>
            </View>
          </View>

          {/* Empty State */}
          <View className="flex-1 items-center justify-center py-16 px-4">
            <View className="items-center gap-3">
              <View className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-700 items-center justify-center">
                <IconSymbol size={32} name="cart.fill" color="#CCCCCC" />
              </View>
              <Text className="text-center text-gray-400 dark:text-gray-500 text-sm">
                El carrito está vacío
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer fijo */}
        <View className="px-4 py-5 gap-4 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-semibold text-black dark:text-white">
              Total:
            </Text>
            <Text className="text-lg font-bold text-orange-500">$0.00</Text>
          </View>

          <TouchableOpacity className="bg-orange-500 rounded-lg py-3 items-center justify-center ">
            <Text className="text-base font-semibold text-white">
              Completar Venta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
