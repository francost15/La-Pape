import { ProductoCategoria } from "@/interface/products";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface BadgeCategoryProductsProps {
  categories: ProductoCategoria[];
  orderBy?: 'asc' | 'desc';
}

function BadgeItem({ category }: { category: ProductoCategoria }) {
  return (
    // el px sirve para el espacio horizontal y el py para el espacio vertical
    <TouchableOpacity className="bg-blue-500 px-4 py-3 rounded-full">
      <Text className="text-white text-sm font-medium">{category.nombre}</Text>
    </TouchableOpacity>
  );
}

export default function BadgeCategoryProducts({ categories, orderBy = 'asc' }: BadgeCategoryProductsProps) {
  const isWeb = Platform.OS === 'web';
  const OrderByCategoryName = categories.sort((a, b) => orderBy === 'asc' ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre));
    // esto es para la vista web
  if (isWeb) {
    return (
      <View className="flex-row flex-wrap gap-2 mb-4">
        {OrderByCategoryName.map((category) => (
          <BadgeItem key={category.id} category={category} />
        ))}
      </View>
    );
  }

  // esto es para la vista mobile
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
      <View className="flex-row gap-4 mb-4">
        {OrderByCategoryName.map((category) => (
          <BadgeItem key={category.id} category={category} />
        ))}
      </View>
    </ScrollView>
  );
}