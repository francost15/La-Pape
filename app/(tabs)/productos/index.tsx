import BadgeCategoryProducts from "@/components/badges/BadgeCategoryProducts";
import CardProducts from "@/components/cards/card-products";
import SearchProducts from "@/components/search/SearchProducts";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import CircleIconButton from "@/components/ui/CircleIconButton";
import EmptyState from "@/components/ui/EmptyState";
import { Bone, ProductListSkeleton } from "@/components/ui/skeletons";
import { Product, type Categoria } from "@/interface";
import { AppColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { useProductSearch } from "@/hooks/use-product-search";
import { useProductosScreen } from "@/hooks/use-productos-screen";
import { useResponsive } from "@/hooks/use-responsive";
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
  View,
} from "react-native";

function ProductosHeader({
  isDesktop,
  searchInputRef,
  searchText,
  setSearchText,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  goToCreateProduct,
  productCount,
}: {
  isDesktop: boolean;
  searchInputRef: React.RefObject<TextInput | null>;
  searchText: string;
  setSearchText: (text: string) => void;
  categories: Categoria[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  goToCreateProduct: () => void;
  productCount: number;
}) {
  return (
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
      {categories.length > 0 ? (
        <BadgeCategoryProducts
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryPress={setSelectedCategoryId}
        />
      ) : null}
      {productCount > 0 ? (
        <AppText
          variant="eyebrow"
          style={{ marginBottom: 12, marginTop: 4, marginLeft: isDesktop ? 4 : 16 }}
        >
          {productCount} {productCount === 1 ? "producto" : "productos"}
        </AppText>
      ) : null}
    </View>
  );
}

function ProductosEmpty({
  isCatalogEmpty,
  onCreate,
}: {
  isCatalogEmpty: boolean;
  onCreate: () => void;
}) {
  if (isCatalogEmpty) {
    return (
      <View className="w-full flex-1 items-center justify-center py-20">
        <EmptyState
          icon="products"
          title={Strings.productos.emptyProductsAvailable}
          description={Strings.productos.emptyProductsHint}
          iconColor={AppColors.primary}
        />
        <View className="mt-4">
          <Button
            title={Strings.productos.createFirstProduct}
            fullWidth={false}
            onPress={onCreate}
          />
        </View>
      </View>
    );
  }
  return (
    <View className="w-full flex-1 items-center justify-center py-20">
      <EmptyState
        icon="search"
        title={Strings.common.noResults}
        description={Strings.productos.noSearchResults}
        iconColor={AppColors.light.textMuted}
      />
    </View>
  );
}

function ProductosFooter({
  loadingMore,
  hasMore,
  onLoadMore,
}: {
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}) {
  if (loadingMore) {
    return (
      <View className="w-full items-center py-4">
        <ActivityIndicator color={AppColors.primary} />
      </View>
    );
  }
  if (!hasMore) return null;
  return (
    <View className="w-full items-center py-4">
      <Button title={Strings.productos.loadMore} fullWidth={false} onPress={onLoadMore} />
    </View>
  );
}

function ProductosSkeleton({ isDesktop, numColumns }: { isDesktop: boolean; numColumns: number }) {
  const bone = isDesktop ? 48 : 40;
  return (
    <AnimatedScreen className="bg-canvas">
      <View
        style={
          isDesktop
            ? { flex: 1, paddingHorizontal: 26, paddingTop: 20 }
            : { flex: 1, paddingTop: 8 }
        }
      >
        <View
          className="flex-row items-center gap-3"
          style={{
            marginBottom: 16,
            marginTop: isDesktop ? 8 : 4,
            paddingHorizontal: isDesktop ? 0 : 16,
          }}
        >
          <View className="flex-1">
            <Bone width="100%" height={bone} borderRadius={12} />
          </View>
          <Bone width={bone} height={bone} borderRadius={isDesktop ? 24 : 20} />
        </View>
        <ProductListSkeleton numColumns={numColumns} count={isDesktop ? numColumns * 2 : 8} />
      </View>
    </AnimatedScreen>
  );
}

function gridPadding(isDesktop: boolean) {
  if (isDesktop) return { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 };
  return { paddingTop: 8, paddingBottom: 120, paddingHorizontal: 0 };
}

function columnCount(isDesktop: boolean, width: number): number {
  if (!isDesktop) return 1;
  if (width >= 1600) return 5;
  if (width >= 1200) return 4;
  if (width >= 992) return 3;
  return 2;
}

export default function ProductosScreen() {
  const { width, isDesktop } = useResponsive();
  const { products, categories, loading, error, retry, refresh } = useProductosScreen();
  const { searchText, setSearchText, selectedCategoryId, setSelectedCategoryId, filteredProducts } =
    useProductSearch("productos");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;
  const searchInputRef = useRef<TextInput>(null);

  const numColumns = columnCount(isDesktop, width);

  const hasMore = filteredProducts.length > page * PAGE_SIZE;
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, page * PAGE_SIZE),
    [filteredProducts, page]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch {
      setRefreshing(false);
      return;
    }
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

  // Carga inicial: skeleton que espeja el grid/lista real (antes se mostraba
  // brevemente el empty state, que se leía como "no hay productos")
  if (loading && products.length === 0) {
    return <ProductosSkeleton isDesktop={isDesktop} numColumns={numColumns} />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas p-4">
        <Text className="mb-4 text-center text-error">{error}</Text>
        <View>
          <Button title={Strings.common.retry} fullWidth={false} onPress={retry} />
        </View>
      </View>
    );
  }

  return (
    <AnimatedScreen className="bg-canvas">
      <FlashList
        key={`products-grid-${numColumns}`}
        data={visibleProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        ListHeaderComponent={
          <ProductosHeader
            isDesktop={isDesktop}
            searchInputRef={searchInputRef}
            searchText={searchText}
            setSearchText={setSearchText}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            goToCreateProduct={goToCreateProduct}
            productCount={filteredProducts.length}
          />
        }
        ListEmptyComponent={
          <ProductosEmpty isCatalogEmpty={products.length === 0} onCreate={goToCreateProduct} />
        }
        ListFooterComponent={
          <ProductosFooter loadingMore={loadingMore} hasMore={hasMore} onLoadMore={loadMore} />
        }
        onEndReached={() => {
          if (hasMore && !loadingMore) loadMore();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={gridPadding(isDesktop)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }
      />
    </AnimatedScreen>
  );
}
