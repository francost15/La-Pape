import { IconSymbol } from "@/components/ui/icon-symbol";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function VentasScreen() {
  return (
    <View className="flex-1 flex-row bg-white dark:bg-neutral-900">
      <View className="flex-1" />
      <ScrollView className="bg-white dark:bg-neutral-900 w-64 border-l border-gray-200 dark:border-neutral-800">
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-200 dark:border-neutral-800">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-bold text-black dark:text-white">
              Carrito (0)
            </Text>
          </View>
        </View>

        {/* Empty State */}
        <View className="flex-1 items-center justify-center py-20">
          <View className="items-center gap-4">
            <View className="w-20 h-20 rounded-full bg-gray-200 dark:bg-neutral-800 items-center justify-center">
              <IconSymbol size={32} name="cart.fill" color="#999999" />
            </View>
            <Text className="text-center text-gray-500 dark:text-gray-400 text-base">
              El carrito está vacío
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="px-4 py-6 gap-4 border-t border-gray-200 dark:border-neutral-800">
          {/* Total */}
          <View className="flex-row justify-between items-center py-4">
            <Text className="text-lg font-semibold text-black dark:text-white">
              Total:
            </Text>
            <Text className="text-lg font-semibold text-orange-500">$0.00</Text>
          </View>

          {/* Button */}
          <TouchableOpacity className="bg-orange-400 rounded-lg py-4 items-center justify-center">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-white">
                $ Completar Venta
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
