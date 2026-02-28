import { IconSymbol } from '@/components/ui/icon-symbol';
import ProductImageDisplay from '@/components/products/ProductImageDisplay';
import ProductPriceCard from '@/components/products/ProductPriceCard';
import ProductStockCard from '@/components/products/ProductStockCard';
import { auth, getProductosScreenData } from '@/lib';
import { notify } from '@/lib/notify';
import { deleteProduct, getProductById } from '@/lib/services/productos';
import { useProductosStore } from '@/store/productos-store';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export default function ProductoById() {
  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const tabBarHeight = useBottomTabBarHeight();

  const {
    currentProduct: product,
    productLoading: loading,
    productImageError: imageError,
    setCurrentProduct,
    setProductLoading,
    setProductImageError,
    categories,
    setProducts,
  } = useProductosStore();
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let isMounted = true;
      let isLoading = false;

      const loadProduct = async () => {
        if (isLoading) return;
        isLoading = true;
        try {
          setProductImageError(false);
          if (productParam) {
            try {
              const parsed = JSON.parse(productParam);
              if (isMounted && parsed) {
                setCurrentProduct(parsed);
                setProductLoading(false);
                isLoading = false;
                return;
              }
            } catch { /* continuar */ }
          }
          const fromStore = useProductosStore.getState().currentProduct;
          if (fromStore && fromStore.id === id) {
            setProductLoading(false);
            isLoading = false;
            getProductById(id)
              .then((u) => { if (isMounted && u) setCurrentProduct(u); })
              .catch(console.error);
            return;
          }
          setProductLoading(true);
          const data = await getProductById(id);
          if (isMounted) setCurrentProduct(data ?? null);
        } catch (e) {
          console.error(e);
          if (isMounted) setCurrentProduct(null);
        } finally {
          if (isMounted) setProductLoading(false);
          isLoading = false;
        }
      };

      loadProduct();
      return () => { isMounted = false; };
    }, [id, productParam, setCurrentProduct, setProductLoading, setProductImageError])
  );

  useEffect(() => {
    if (product?.nombre) navigation.setOptions({ title: product.nombre });
  }, [product?.nombre, navigation]);

  if (loading && !product) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando producto...</Text>
      </View>
    );
  }
  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900">
        <Text className="text-lg text-gray-500 dark:text-gray-400">Producto no encontrado</Text>
      </View>
    );
  }

  const handleEdit = () => router.push(`/productos/producto/${product.id}/edit` as any);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar producto',
      `¿Eliminar "${product.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteProduct(product.id);
              const user = auth.currentUser;
              if (user) {
                const storeData = await getProductosScreenData(user.uid, user.email || '');
                setProducts(storeData.products);
              }
              setCurrentProduct(null);
              notify.success({ title: `${product.nombre} eliminado` });
              router.replace('/productos' as any);
            } catch (error: any) {
              notify.error({ title: 'Error', description: error?.message || 'No se pudo eliminar' });
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const categoria = categories.find((c) => c.id === product.categoria_id);
  const hasImg = Boolean(product.imagen?.trim()) && !imageError;
  const isCritical = product.cantidad <= (product.stock_minimo ?? 0);

  // ─── Info del producto — compartida entre desktop y mobile ──────────────────
  const infoSection = (
    <>
      <Text className="text-2xl font-bold text-gray-900 dark:text-white leading-snug">
        {product.nombre}
      </Text>
      <View className="flex-row items-center gap-2 mt-1 flex-wrap">
        {product.marca ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">{product.marca}</Text>
        ) : null}
        {categoria ? (
          <>
            {product.marca ? <View className="w-1 h-1 rounded-full bg-gray-300 dark:bg-neutral-600" /> : null}
            <View className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Text className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                {categoria.nombre}
              </Text>
            </View>
          </>
        ) : null}
      </View>
      {product.descripcion ? (
        <Text className="text-sm text-gray-500 dark:text-gray-400 leading-5 mt-2">
          {product.descripcion}
        </Text>
      ) : null}
    </>
  );

  // ─── Botones — compartidos entre desktop y mobile ────────────────────────────
  const actionButtons = (
    <View className="flex-row gap-2">
      {/* Eliminar: acción destructiva secundaria */}
      <TouchableOpacity
        onPress={handleDelete}
        disabled={deleting}
        className="h-11 px-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-900/20 flex-row items-center justify-center gap-1.5 active:opacity-80"
      >
        {deleting ? (
          <ActivityIndicator color="#dc2626" size="small" />
        ) : (
          <Text className="text-red-600 dark:text-red-400 text-sm font-medium">Eliminar</Text>
        )}
      </TouchableOpacity>

      {/* Editar: CTA principal */}
      <TouchableOpacity
        onPress={handleEdit}
        disabled={deleting}
        className="flex-1 h-11 bg-orange-600 rounded-xl flex-row items-center justify-center gap-2 active:opacity-80"
      >
        <IconSymbol name="pencil" size={15} color="white" />
        <Text className="text-white font-semibold text-[15px]">Editar Producto</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Layout DESKTOP (≥ 768px) ───────────────────────────────────────────────
  // Imagen grande izquierda, info + botones derecha. Sin barra inferior fija.
  if (isDesktop) {
    return (
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-neutral-900"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', padding: 40 }}
      >
        <View style={{ width: '100%', maxWidth: 1100 }} className="flex-row gap-10 items-start">
          <View
            className="rounded-3xl overflow-hidden bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 shrink-0"
            style={{ width: 420, height: 420 }}
          >
            <ProductImageDisplay
              uri={product.imagen}
              hasImg={hasImg}
              onError={() => setProductImageError(true)}
            />
          </View>

          <View className="flex-1 gap-4">
            <View className="gap-1">{infoSection}</View>
            <ProductPriceCard
              precioVenta={product.precio_venta}
              precioMayoreo={product.precio_mayoreo}
              costoPromedio={product.costo_promedio}
            />
            <ProductStockCard
              cantidad={product.cantidad}
              stockMinimo={product.stock_minimo}
              isCritical={isCritical}
            />
            {actionButtons}
          </View>
        </View>
      </ScrollView>
    );
  }

  // ─── Layout MOBILE (< 768px) ────────────────────────────────────────────────
  // Imagen 4:3 arriba, info + datos, barra de acciones fija al pie.
  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-900">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="w-full rounded-2xl overflow-hidden bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700"
          style={{ aspectRatio: 4 / 3 }}
        >
          <ProductImageDisplay
            uri={product.imagen}
            hasImg={hasImg}
            onError={() => setProductImageError(true)}
          />
        </View>

        <View className="gap-1 pt-1">{infoSection}</View>

        <ProductPriceCard
          precioVenta={product.precio_venta}
          precioMayoreo={product.precio_mayoreo}
          costoPromedio={product.costo_promedio}
        />

        <ProductStockCard
          cantidad={product.cantidad}
          stockMinimo={product.stock_minimo}
          isCritical={isCritical}
        />
      </ScrollView>

      {/* Barra fija — paddingBottom evita solapamiento con el tab bar */}
      <View
        className="px-4 py-3 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800"
        style={{ paddingBottom: 12 + tabBarHeight }}
      >
        {actionButtons}
      </View>
    </View>
  );
}
