import BadgeCategoryProducts from '@/components/badges/BadgeCategoryProducts';
import CardProducts from '@/components/cards/card-products';
import SearchProducts from '@/components/search/SearchProducts';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useProductSearch } from '@/hooks/use-product-search';
import { useProductosScreen } from '@/hooks/use-productos-screen';
import { router } from 'expo-router';
import React from 'react';
import { Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProductosScreen() {
  const isWeb = Platform.OS === 'web';
  const { products, categories, error, retry, refresh } = useProductosScreen();
  const { searchText, setSearchText, selectedCategoryId, setSelectedCategoryId, filteredProducts } = useProductSearch();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);


  if (error) {
    return (
      <View className="flex-1 bg-gray-100 dark:bg-neutral-900 justify-center items-center p-4">
        <Text className="text-red-600 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-orange-600 px-4 py-3 rounded-lg"
          onPress={retry}
        >
          <Text className="text-white font-semibold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100 dark:bg-neutral-900"
      contentContainerStyle={{ padding: isWeb ? 21 : 12 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ea580c"
          colors={['#ea580c']}
        />
      }
    >
      {/* Barra de búsqueda */}
      <View className="flex-row gap-3 mb-4" style={{ alignItems: 'stretch' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <SearchProducts searchText={searchText} onSearchChange={setSearchText} />
        </View>
        <TouchableOpacity
          style={{ flexShrink: 0 }}
          className={`bg-orange-600 ${isWeb ? 'px-4 py-3' : 'px-3 py-2'} rounded-lg justify-center items-center flex-row gap-2`}
          onPress={() => router.push('/productos/create')}
        >
          <IconSymbol name="plus.circle.fill" size={isWeb ? 20 : 18} color="white" />
          <Text className={`text-white font-semibold ${isWeb ? 'text-base' : 'text-sm'}`}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {/* Categorias de productos ordenadas por nombre asc */}
      {categories.length > 0 && (
        <BadgeCategoryProducts 
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryPress={setSelectedCategoryId}
        />
      )}

      {/* Productos */}
      <View className="flex-row flex-wrap gap-4 justify-center">
        {filteredProducts.length ? (
          filteredProducts.map((product) => (
            <View key={product.id} className={isWeb ? 'w-80' : 'w-52'}>
              <CardProducts product={product} />
            </View>
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-20 w-full">
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
              {products.length === 0 
                ? 'No hay productos disponibles'
                : 'No se encontraron productos con esa búsqueda'}
            </Text>
            {products.length === 0 && (
              <TouchableOpacity
                className="bg-orange-600 px-4 py-3 rounded-lg"
                onPress={() => router.push('/productos/create')}
              >
                <Text className="text-white font-semibold">Crear primer producto</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
