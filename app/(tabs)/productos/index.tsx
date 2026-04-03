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
import { FlashList } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function ProductosScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { products, categories, error, retry, refresh } = useProductosScreen();
  const { searchText, setSearchText, selectedCategoryId, setSelectedCategoryId, filteredProducts } =
    useProductSearch("productos");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;
  const searchInputRef = useRef<TextInput>(null);

  const numColumns = useMemo(() => {
    if (!isDesktop) return 1;
    if (width >= 1600) return 5;
    if (width >= 1200) return 4;
    if (width >= 992) return 3;
    return 2;
  }, [width, isDesktop]);

  const hasMore = filteredProducts.length > page * PAGE_SIZE;
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, page * PAGE_SIZE),
    [filteredProducts, page]
  );

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
      <View style={{ flex: 1, padding: isDesktop ? 10 : 0 }}>
        <CardProducts product={item} />
      </View>
    ),
    [isDesktop]
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View style={{ width: "100%", paddingHorizontal: isDesktop ? 10 : 0 }}>
        <View 
          className="flex-row items-stretch gap-3" 
          style={{ marginBottom: 16, marginTop: isDesktop ? 8 : 4 }}
        >
          <View className="min-w-0 flex-1">
            <SearchProducts
              ref={searchInputRef}
              searchText={searchText}
              onSearchChange={setSearchText}
              size={isDesktop ? "large" : "default"}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goToCreateProduct}
            className="shrink-0 flex-row items-center"
          >
            <CircleIconButton
              icon="plus"
              variant="primary"
              onPress={goToCreateProduct}
              size={isDesktop ? 48 : 40}
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

        {/* Dynamic products count */}
        {filteredProducts.length > 0 && (
           <Text 
            className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] dark:text-[#5A6478]"
            style={{ marginBottom: 12, marginTop: 4, marginLeft: isDesktop ? 4 : 16 }}
           >
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
           </Text>
        )}
      </View>
    ),
    [
      isDesktop,
      searchText,
      setSearchText,
      categories,
      selectedCategoryId,
      setSelectedCategoryId,
      goToCreateProduct,
      filteredProducts.length
    ]
  );

  const ListFooter = useMemo(
    () => (
      <View className="w-full items-center py-4">
        {loadingMore ? (
          <ActivityIndicator color="#ea580c" />
        ) : hasMore ? (
          <TouchableOpacity
            className="rounded-xl px-6 py-3"
            style={{ backgroundColor: "#ea580c" }}
            onPress={loadMore}
          >
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
              className="mt-4 rounded-xl px-5 py-3.5"
              style={{ backgroundColor: "#ea580c" }}
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
      <View className="flex-1 items-center justify-center bg-[#FAFAF9] p-4 dark:bg-[#0C0F14]">
        <Text className="mb-4 text-center text-red-500">{error}</Text>
        <TouchableOpacity
          className="rounded-xl px-5 py-3.5"
          style={{ backgroundColor: "#ea580c" }}
          onPress={retry}
        >
          <Text className="font-semibold text-white">{Strings.common.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedScreen>
      <FlashList
        key={`products-grid-${numColumns}`}
        data={visibleProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        onEndReached={() => {
          if (hasMore && !loadingMore) loadMore();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={
          isDesktop
            ? { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 }
            : { paddingTop: 8, paddingBottom: 120, paddingHorizontal: 0 }
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
      />
    </AnimatedScreen>
  );
}
