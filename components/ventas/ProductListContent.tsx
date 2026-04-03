import SearchProducts from "@/components/search/SearchProducts";
import { useProductSearch } from "@/hooks/use-product-search";
import { useProductosScreen } from "@/hooks/use-productos-screen";
import type { SearchContextId } from "@/store/product-search-store";
import EmptyState from "@/components/ui/EmptyState";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
 * ProductListContent — Digital Atelier style.
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? AppColors.dark : AppColors.light;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
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
            padding: 24,
            gap: 16,
          }}
        >
          <Text
            style={{
              color: "#f43f5e",
              textAlign: "center",
              fontSize: 15,
              fontFamily: AppFonts.body,
              marginBottom: 4,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#ea580c",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 14,
            }}
            onPress={retry}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: 15,
                fontFamily: AppFonts.bodyStrong,
              }}
            >
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          key={listKey}
          style={{ flex: 1 }}
          contentContainerStyle={[
            { paddingHorizontal: isDesktop ? 24 : 0, paddingBottom: 48, flexGrow: 1 },
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
                iconColor={isDark ? "#5A6478" : "#9CA3AF"}
              />
            ) : (
              <EmptyState
                icon="search"
                title="Sin resultados"
                description="No hay productos que coincidan"
                iconColor={isDark ? "#5A6478" : "#9CA3AF"}
              />
            )
          }
          keyboardDismissMode={keyboardDismissMode}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={index < STAGGER_LIMIT ? FadeIn.delay(index * 40).duration(240) : undefined}
              style={{ marginBottom: isDesktop ? 12 : 0 }}
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
