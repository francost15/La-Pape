import { Platform, TextInput, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

export default function SearchProducts() {
    const isWeb = Platform.OS === 'web';
    return (
        <View className="flex-1 bg-white dark:bg-neutral-800 rounded-lg px-3 py-3 flex-row items-center ">
        <IconSymbol name="magnifyingglass" size={22} color={isWeb ? '#6b7280' : '#9ca3af'} />
        <TextInput
          className="flex-1 ml-3 text-gray-900 dark:text-white outline-none"
          placeholder="Buscar productos..."
          placeholderTextColor={isWeb ? '#9ca3af' : '#6b7280'}
        />
      </View>
    )
}