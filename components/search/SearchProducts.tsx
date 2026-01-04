import { Platform, TextInput, View } from "react-native";
import { useState } from "react";
import { IconSymbol } from "../ui/icon-symbol";

interface SearchProductsProps {
  onSearchChange: (searchText: string) => void;
}

export default function SearchProducts({ onSearchChange }: SearchProductsProps) {
    const isWeb = Platform.OS === 'web';
    const [searchText, setSearchText] = useState('');

    const handleChangeText = (text: string) => {
      setSearchText(text);
      onSearchChange(text);
    };

    return (
        <View className={`flex-1 bg-white dark:bg-neutral-800 rounded-lg px-3 ${isWeb ? 'py-3' : 'py-2'} flex-row items-center`}>
        <IconSymbol name="magnifyingglass" size={isWeb ? 22 : 20} color={isWeb ? '#6b7280' : '#9ca3af'} />
        <TextInput
          className="flex-1 ml-3 text-gray-900 dark:text-white outline-none"
          placeholder="Buscar por nombre, marca o categoría..."
          placeholderTextColor={isWeb ? '#9ca3af' : '#6b7280'}
          value={searchText}
          onChangeText={handleChangeText}
        />
      </View>
    )
}