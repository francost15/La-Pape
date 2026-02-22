import BadgeCategoryProducts from "@/components/badges/BadgeCategoryProducts";
import CardProducts from "@/components/cards/card-products";
import SearchProducts from "@/components/search/SearchProducts";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import CircleIconButton from "@/components/ui/CircleIconButton";
import { useProductSearch } from "@/hooks/use-product-search";
import { useProductosScreen } from "@/hooks/use-productos-screen";
import { useLayoutStore } from "@/store/layout-store";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductosScreen() {
  const isMobile = useLayoutStore((s) => s.isMobile);
  const { products, categories, error, retry, refresh } = useProductosScreen();
  const {
    searchText,
    setSearchText,
    selectedCategoryId,
    setSelectedCategoryId,
    filteredProducts,
  } = useProductSearch("productos");
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-4 dark:bg-neutral-900">
        <Text className="mb-4 text-center text-red-600">{error}</Text>
        <TouchableOpacity
          className="rounded-lg bg-orange-600 px-4 py-3"
          onPress={retry}
        >
          <Text className="font-semibold text-white">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedScreen>
      <ScrollView
        className="flex-1 bg-gray-100 dark:bg-neutral-900"
        contentContainerStyle={
          isMobile
            ? { paddingTop: 8, paddingBottom: 120, paddingHorizontal: 0 }
            : { padding: 21, paddingBottom: 21 }
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ea580c"
            colors={["#ea580c"]}
          />
        }
      >
        {/* Barra de búsqueda */}
        <View
          className={`flex-row items-stretch gap-3 ${isMobile ? "mb-4 px-2" : "mb-4"}`}
        >
          <View className="min-w-0 flex-1">
            <SearchProducts
              searchText={searchText}
              onSearchChange={setSearchText}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/productos/create")}
            className="shrink-0 flex-row items-center gap-2"
          >
            <CircleIconButton
              icon="plus"
              variant="primary"
              onPress={() => router.push("/productos/create")}
              size={isMobile ? 40 : 44}
            />
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        {categories.length > 0 && (
          <BadgeCategoryProducts
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryPress={setSelectedCategoryId}
          />
        )}

        {/* Productos */}
        <View
          className={
            isMobile
              ? "w-full"
              : "flex-row flex-wrap justify-center gap-4"
          }
        >
          {filteredProducts.length ? (
            filteredProducts.map((product) => (
              <View
                key={product.id}
                className={isMobile ? "w-full" : "w-80"}
              >
                <CardProducts product={product} />
              </View>
            ))
          ) : (
            <View className="w-full flex-1 items-center justify-center py-20">
              <Text className="mb-4 text-center text-gray-500 dark:text-gray-400">
                {products.length === 0
                  ? "No hay productos disponibles"
                  : "No se encontraron productos con esa búsqueda"}
              </Text>
              {products.length === 0 && (
                <TouchableOpacity
                  className="rounded-lg bg-orange-600 px-4 py-3"
                  onPress={() => router.push("/productos/create")}
                >
                  <Text className="font-semibold text-white">
                    Crear primer producto
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}
