import SearchProducts from "@/components/search/SearchProducts";
import { useProductSearch } from "@/hooks/use-product-search";
import { useProductosScreen } from "@/hooks/use-productos-screen";
import type { SearchContextId } from "@/store/product-search-store";
import EmptyState from "@/components/ui/EmptyState";
import React from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import ProductCardMobile from "./ProductCardMobile";
import ProductItemVenta from "./ProductItemVenta";

const STAGGER_LIMIT = 10;

interface ProductListContentProps {
  searchContextId: SearchContextId;
  onProductAdded?: (productName: string) => void;
  searchSize?: "default" | "large";
  showQrButton?: boolean;
  onQrPress?: () => void;
  listKey?: string;
  contentContainerStyle?: object;
  keyboardDismissMode?: "none" | "on-drag" | "interactive";
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  searchInputRef?: React.RefObject<TextInput | null>;
}

/**
 * Contenido reutilizable: búsqueda + lista de productos.
 * Usado por SidebarProducts (PC) y FooterProducts (mobile).
 */
export default function ProductListContent({
  searchContextId,
  onProductAdded,
  searchSize = "default",
  showQrButton = false,
  onQrPress,
  listKey = "list",
  contentContainerStyle,
  keyboardDismissMode,
  keyboardShouldPersistTaps,
  searchInputRef,
}: ProductListContentProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { products, error, retry, refresh, loading } = useProductosScreen();
  const { searchText, setSearchText, filteredProducts } = useProductSearch(searchContextId);
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
          ref={searchInputRef}
          searchText={searchText}
          onSearchChange={setSearchText}
          size={searchSize}
          showQrButton={showQrButton}
          onQrPress={onQrPress}
        />
      </View>
      {error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Text style={{ color: "#dc2626", textAlign: "center", marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#ea580c",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
            }}
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
            { paddingHorizontal: isDesktop ? 8 : 0, paddingBottom: 24, flexGrow: 1 },
            contentContainerStyle,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ea580c" />
          }
          ListEmptyComponent={
            loading ? null : products.length === 0 ? (
              <EmptyState
                icon="products"
                title="No hay productos"
                description="Crea productos para comenzar a vender"
                iconColor="#9ca3af"
              />
            ) : (
              <EmptyState
                icon="search"
                title="Sin resultados"
                description="No hay productos que coincidan con tu búsqueda"
                iconColor="#9ca3af"
              />
            )
          }
          keyboardDismissMode={keyboardDismissMode}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={index < STAGGER_LIMIT ? FadeIn.delay(index * 40).duration(200) : undefined}
              style={{ marginBottom: isDesktop ? 10 : 0 }}
            >
              {isDesktop ? (
                <ProductItemVenta
                  product={item}
                  compact
                  onProductAdded={() => onProductAdded?.(item.nombre)}
                />
              ) : (
                <ProductCardMobile
                  product={item}
                  onProductAdded={() => onProductAdded?.(item.nombre)}
                />
              )}
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}
