import type { SearchContextId } from "@/store/product-search-store";
import BadgeCategoryProducts from "@/components/badges/BadgeCategoryProducts";
import SearchProducts from "@/components/search/SearchProducts";
import { useProductSearch } from "@/hooks/use-product-search";
import { useProductosScreen } from "@/hooks/use-productos-screen";
import React from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ProductItemVenta from "./ProductItemVenta";

interface ProductListContentProps {
  /** Contexto de búsqueda: "productos" (tab) o "ventas" (sheet/sidebar) */
  searchContextId: SearchContextId;
  onProductAdded?: (productName: string) => void;
  searchSize?: "default" | "large";
  listKey?: string;
  contentContainerStyle?: object;
  keyboardDismissMode?: "none" | "on-drag" | "interactive";
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
}

/**
 * Contenido reutilizable: búsqueda + categorías + lista de productos.
 * Usado por SidebarProducts (PC) y FooterProducts (mobile).
 */
export default function ProductListContent({
  searchContextId,
  onProductAdded,
  searchSize = "default",
  listKey = "list",
  contentContainerStyle,
  keyboardDismissMode,
  keyboardShouldPersistTaps,
}: ProductListContentProps) {
  const { products, categories, error, retry, refresh, loading } = useProductosScreen();
  const {
    searchText,
    setSearchText,
    selectedCategoryId,
    setSelectedCategoryId,
    filteredProducts,
  } = useProductSearch(searchContextId);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={{ paddingHorizontal: 8, marginBottom: 8 }}>
        <SearchProducts
          searchText={searchText}
          onSearchChange={setSearchText}
          size={searchSize}
        />
      </View>
      {categories.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <BadgeCategoryProducts
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryPress={setSelectedCategoryId}
          />
        </View>
      )}
      {error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
          <Text style={{ color: "#dc2626", textAlign: "center", marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity
            style={{ backgroundColor: "#ea580c", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
            onPress={retry}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          key={listKey}
          style={{ flex: 1 }}
          contentContainerStyle={[
            { paddingHorizontal: 8, paddingBottom: 24, flexGrow: 1 },
            contentContainerStyle,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#ea580c"
            />
          }
          ListEmptyComponent={
            loading ? null : (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <Text style={{ color: "#6b7280", textAlign: "center" }}>
                  {products.length === 0 ? "No hay productos" : "No hay resultados"}
                </Text>
              </View>
            )
          }
          keyboardDismissMode={keyboardDismissMode}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 6 }}>
              <ProductItemVenta
                product={item}
                compact
                onProductAdded={() => onProductAdded?.(item.nombre)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
