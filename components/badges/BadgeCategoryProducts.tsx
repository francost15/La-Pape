import { Categoria } from "@/interface/categorias";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface BadgeCategoryProductsProps {
  categories: Categoria[];
  orderBy?: 'asc' | 'desc';
  selectedCategoryId?: string | null;
  onCategoryPress: (categoryId: string | null) => void;
}

function BadgeItem({ 
  category, 
  isSelected, 
  onPress 
}: { 
  category: Categoria;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      className={`px-4 py-3 rounded-full ${isSelected ? 'bg-orange-600 ' : 'bg-neutral-200 dark:bg-neutral-700 '}`}
      onPress={onPress}
    >
      <Text className={`${isSelected ? 'text-white' : 'text-black'} text-sm font-medium dark:text-white`}>{category.nombre}</Text>
    </TouchableOpacity>
  );
}

export default function BadgeCategoryProducts({ 
  categories, 
  orderBy = 'asc',
  selectedCategoryId,
  onCategoryPress
}: BadgeCategoryProductsProps) {
  const isWeb = Platform.OS === 'web';
  const sortedCategories = [...categories].sort((a, b) => 
    orderBy === 'asc' ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre)
  );

  const handleCategoryPress = (categoryId: string) => {
    // Si se hace clic en la categoría ya seleccionada, deseleccionarla
    if (selectedCategoryId === categoryId) {
      onCategoryPress(null);
    } else {
      onCategoryPress(categoryId);
    }
  };

  // esto es para la vista web
  if (isWeb) {
    return (
      <View className="flex-row flex-wrap gap-2 mb-4">
        {sortedCategories.map((category) => (
          <BadgeItem 
            key={category.id} 
            category={category}
            isSelected={selectedCategoryId === category.id}
            onPress={() => handleCategoryPress(category.id)}
          />
        ))}
      </View>
    );
  }

  // esto es para la vista mobile
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
      <View className="flex-row gap-4 mb-4">
        {sortedCategories.map((category) => (
          <BadgeItem 
            key={category.id} 
            category={category}
            isSelected={selectedCategoryId === category.id}
            onPress={() => handleCategoryPress(category.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}