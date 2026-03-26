import BadgeCategoryProducts from "@/components/badges/BadgeCategoryProducts";
import CardProducts from "@/components/cards/card-products";
import SearchProducts from "@/components/search/SearchProducts";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import CircleIconButton from "@/components/ui/CircleIconButton";
import EmptyState from "@/components/ui/EmptyState";
import { Product } from "@/interface";
import { Strings } from "@/constants/strings";
import { useProductSearch } from "@/hooks/use-product-search";
import { useProductosScreen } from "@/hooks/use-productos-screen";
import { useLayoutStore } from "@/store/layout-store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProductosScreen() {
  const isMobile = useLayoutStore((s) => s.isMobile);
  const { products, categories, error, retry, refresh } = useProductosScreen();
  const { searchText, setSearchText, selectedCategoryId, setSelectedCategoryId, filteredProducts } =
    useProductSearch("productos");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;
  const searchInputRef = useRef<TextInput>(null);

  const hasMore = filteredProducts.length > page * PAGE_SIZE;
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, page * PAGE_SIZE),
    [filteredProducts, page]
  );

  const numColumns = isMobile ? 1 : 3;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setPage((p) => p + 1);
    setLoadingMore(false);
  }, [hasMore, loadingMore]);

  const goToCreateProduct = useCallback(() => {
    router.push("/productos/create");
  }, []);

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const clearSearch = useCallback(() => {
    setSearchText("");
  }, [setSearchText]);

  const shortcuts = useMemo(
    () => [
      {
        key: "n",
        ctrl: true,
        handler: goToCreateProduct,
        description: "Crear producto",
      },
      {
        key: "/",
        handler: focusSearch,
        description: "Enfocar búsqueda",
      },
      {
        key: "Escape",
        handler: clearSearch,
        description: "Limpiar búsqueda",
      },
    ],
    [goToCreateProduct, focusSearch, clearSearch]
  );

  useKeyboardShortcuts(shortcuts, Platform.OS === "web");

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View className={isMobile ? "w-full" : "m-2 w-80"}>
        <CardProducts product={item} />
      </View>
    ),
    [isMobile]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <>
        <View className={`flex-row items-stretch gap-3 ${isMobile ? "mb-4 px-2" : "mb-4"}`}>
          <View className="min-w-0 flex-1">
            <SearchProducts
              ref={searchInputRef}
              searchText={searchText}
              onSearchChange={setSearchText}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goToCreateProduct}
            className="shrink-0 flex-row items-center gap-2"
          >
            <CircleIconButton
              icon="plus"
              variant="primary"
              onPress={goToCreateProduct}
              size={isMobile ? 40 : 44}
            />
          </TouchableOpacity>
        </View>

        {categories.length > 0 && (
          <BadgeCategoryProducts
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryPress={setSelectedCategoryId}
          />
        )}
      </>
    ),
    [
      isMobile,
      searchText,
      setSearchText,
      categories,
      selectedCategoryId,
      setSelectedCategoryId,
      goToCreateProduct,
    ]
  );

  const ListFooter = useMemo(
    () => (
      <View className="w-full items-center py-4">
        {loadingMore ? (
          <ActivityIndicator color="#ea580c" />
        ) : hasMore ? (
          <TouchableOpacity className="rounded-lg bg-orange-600 px-6 py-3" onPress={loadMore}>
            <Text className="font-semibold text-white">{Strings.productos.loadMore}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ),
    [loadingMore, hasMore, loadMore]
  );

  const ListEmpty = useMemo(
    () => (
      <View className="w-full flex-1 items-center justify-center py-20">
        {products.length === 0 ? (
          <>
            <EmptyState
              icon="products"
              title={Strings.productos.emptyProductsAvailable}
              description={Strings.productos.emptyProductsHint}
              iconColor="#ea580c"
            />
            <TouchableOpacity
              className="mt-4 rounded-lg bg-orange-600 px-4 py-3"
              onPress={goToCreateProduct}
            >
              <Text className="font-semibold text-white">
                {Strings.productos.createFirstProduct}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <EmptyState
            icon="search"
            title={Strings.common.noResults}
            description={Strings.productos.noSearchResults}
            iconColor="#9ca3af"
          />
        )}
      </View>
    ),
    [products.length, goToCreateProduct]
  );

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-4 dark:bg-neutral-900">
        <Text className="mb-4 text-center text-red-600">{error}</Text>
        <TouchableOpacity className="rounded-lg bg-orange-600 px-4 py-3" onPress={retry}>
          <Text className="font-semibold text-white">{Strings.common.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedScreen>
      <FlatList
        key={numColumns}
        data={visibleProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={isMobile ? 1 : numColumns}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        className="flex-1 bg-gray-100 dark:bg-neutral-900"
        contentContainerStyle={
          isMobile
            ? { paddingTop: 8, paddingBottom: 120, paddingHorizontal: 0 }
            : { padding: 21, paddingBottom: 21, alignItems: "center" }
        }
        columnWrapperStyle={!isMobile ? { justifyContent: "center" } : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ea580c"
            colors={["#ea580c"]}
          />
        }
      />
    </AnimatedScreen>
  );
}
