import SearchProducts from "@/components/search/SearchProducts";
import { useProductSearch } from "@/hooks/use-product-search";
import { useProductosScreen } from "@/hooks/use-productos-screen";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { ProductListContentProps } from "@/interface/ventas";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeletons";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { DESKTOP_MIN_WIDTH } from "@/constants/design-system";
import React from "react";
import { FlatList, RefreshControl, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import ProductCardMobile from "./ProductCardMobile";
import ProductItemVenta from "./ProductItemVenta";

/**
 * ProductListContent — Digital Atelier style.
 *
 * Renderiza la barra de búsqueda + lista de productos.
 * Desktop usa ProductItemVenta (filas), mobile usa ProductCardMobile.
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
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const { colors } = useThemeColors();
  const { products, error, retry, refresh, loading } = useProductosScreen();
  const { searchText, setSearchText, filteredProducts } = useProductSearch(searchContextId);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const productCount = filteredProducts.length;

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      {/* ── Búsqueda + conteo ───────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: isDesktop ? 24 : 16,
          paddingTop: isDesktop ? 20 : 12,
          paddingBottom: 4,
        }}
      >
        <SearchProducts
          ref={searchInputRef}
          searchText={searchText}
          onSearchChange={setSearchText}
          size={searchSize}
          showQrButton={showQrButton}
          onQrPress={onQrPress}
        />
        {!error && productCount > 0 && (
          <Text
            style={{
              fontSize: 12,
              color: colors.textLabel,
              fontFamily: AppFonts.body,
              marginTop: 10,
              letterSpacing: 0.3,
              textTransform: "uppercase",
            }}
          >
            {productCount} {productCount === 1 ? "producto" : "productos"}
            {searchText.trim() ? ` para "${searchText.trim()}"` : ""}
          </Text>
        )}
      </View>

      {/* ── Contenido ───────────────────────────────────────── */}
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
          {/* Wrapper: Button con fullWidth=false usa alignSelf flex-start, que
              anularía el centrado del contenedor de error */}
          <View>
            <Button title="Reintentar" onPress={retry} fullWidth={false} />
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          key={listKey}
          style={{ flex: 1 }}
          contentContainerStyle={[
            { paddingHorizontal: 0, paddingBottom: 48, flexGrow: 1 },
            contentContainerStyle,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={AppColors.primary}
            />
          }
          ListEmptyComponent={
            loading ? (
              <Animated.View entering={FadeIn} style={{ flex: 1, marginTop: 8 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <View
                    key={`skeleton-${i}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: isDesktop ? 24 : 16,
                      paddingVertical: 12,
                      gap: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Skeleton
                      width={isDesktop ? 64 : 48}
                      height={isDesktop ? 64 : 48}
                      borderRadius={10}
                    />
                    <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
                      <Skeleton width="65%" height={16} />
                      <Skeleton width="40%" height={14} />
                      <Skeleton width="25%" height={18} />
                    </View>
                    <Skeleton width={38} height={38} borderRadius={19} />
                  </View>
                ))}
              </Animated.View>
            ) : products.length === 0 ? (
              <EmptyState
                icon="products"
                title="No hay productos"
                description="Crea productos para comenzar a vender"
                iconColor={colors.textMuted}
              />
            ) : (
              <EmptyState
                icon="search"
                title="Sin resultados"
                description="No hay productos que coincidan"
                iconColor={colors.textMuted}
              />
            )
          }
          keyboardDismissMode={keyboardDismissMode}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          renderItem={({ item }) =>
            isDesktop ? (
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
            )
          }
        />
      )}
    </View>
  );
}
