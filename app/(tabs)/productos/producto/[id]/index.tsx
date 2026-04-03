import { IconSymbol } from '@/components/ui/icon-symbol';
import ProductImageDisplay from '@/components/products/ProductImageDisplay';
import QRCode from 'react-native-qrcode-svg';
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
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useHaptic } from "@/hooks/use-haptic";
import { AppFonts } from '@/constants/typography';
import { AppColors } from '@/constants/colors';

export default function ProductoById() {
  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const tabBarHeight = useBottomTabBarHeight();

  const haptic = useHaptic();
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

  const handleEdit = () => {
    if (product) router.push(`/productos/producto/${product.id}/edit` as any);
  };

  const handleDelete = () => {
    if (!product) return;
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
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'No se pudo eliminar';
              notify.error({ title: 'Error', description: message });
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !product) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAFAF9] dark:bg-[#0C0F14]">
        <ActivityIndicator size="large" color={AppColors.primary} />
        <View className="mt-4">
          <Text className="text-[#6B7280] dark:text-[#9CA3AF]">Cargando producto...</Text>
        </View>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-[#FAFAF9] dark:bg-[#0C0F14]">
        <Text className="text-lg text-[#6B7280] dark:text-[#9CA3AF]">Producto no encontrado</Text>
      </View>
    );
  }

  const categoria = categories.find((c) => c.id === product.categoria_id);
  const hasImg = Boolean(product.imagen?.trim()) && !imageError;
  const isCritical = product.cantidad <= (product.stock_minimo ?? 0);

  const BackButton = () => (
    <Pressable
      onPress={() => {
        haptic();
        router.back();
      }}
      className="flex-row items-center gap-2 mb-6 active:opacity-70"
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <IconSymbol name="chevron.left" size={18} color={AppColors.light.textSecondary} />
      <Text
        className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] dark:text-[#5A6478]"
        style={{ fontFamily: AppFonts.bodyStrong }}
      >
        VOLVER
      </Text>
    </Pressable>
  );

  const infoSection = (
    <View>
      <Text
        className="text-3xl tracking-tighter text-[#111827] dark:text-[#F9FAFB]"
        style={{ fontFamily: AppFonts.display, lineHeight: 36 }}
      >
        {product.nombre}
      </Text>
      <View className="flex-row items-center gap-2 mt-2 flex-wrap">
        {product.marca ? (
          <Text
            className="text-xs uppercase tracking-widest text-[#9CA3AF] dark:text-[#5A6478]"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            {product.marca}
          </Text>
        ) : null}
        {categoria ? (
          <>
            {product.marca ? <View className="w-1 h-1 rounded-full bg-[#D1D5DB] dark:bg-[#4B5563]" /> : null}
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(234, 88, 12, 0.08)' }}
            >
              <Text
                className="text-[10px] font-bold tracking-widest text-[#EA580C] dark:text-[#FB923C] uppercase"
                style={{ fontFamily: AppFonts.bodyStrong }}
              >
                {categoria.nombre}
              </Text>
            </View>
          </>
        ) : null}
      </View>
      {product.descripcion ? (
        <Text
          className="text-base text-[#6B7280] dark:text-[#A1A1AA] leading-6 mt-4"
          style={{ fontFamily: AppFonts.body }}
        >
          {product.descripcion}
        </Text>
      ) : null}
    </View>
  );

  const actionButtons = (
    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={handleDelete}
        disabled={deleting}
        className="h-12 w-12 rounded-full flex-row items-center justify-center active:opacity-80"
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderWidth: 1,
          borderColor: 'rgba(239, 68, 68, 0.1)',
          boxShadow: Platform.OS === 'web' ? '0 4px 12px rgba(239, 68, 68, 0.1)' : undefined,
          elevation: Platform.OS !== 'web' ? 3 : undefined,
        }}
        accessibilityRole="button"
        accessibilityLabel="Eliminar producto"
      >
        {deleting ? (
          <ActivityIndicator color={AppColors.error} size="small" />
        ) : (
          <IconSymbol name="trash.fill" size={18} color={AppColors.error} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleEdit}
        disabled={deleting}
        className="flex-1 h-12 bg-[#EA580C] rounded-full flex-row items-center justify-center gap-2 active:opacity-90"
        style={{
          boxShadow: Platform.OS === 'web' ? '0 8px 24px rgba(234, 88, 12, 0.3)' : undefined,
          elevation: Platform.OS !== 'web' ? 6 : undefined,
        }}
        accessibilityRole="button"
        accessibilityLabel="Editar producto"
      >
        <IconSymbol name="pencil" size={16} color="white" />
        <Text
          className="text-white font-bold text-[15px] tracking-wide"
          style={{ fontFamily: AppFonts.bodyStrong }}
        >
          EDITAR PRODUCTO
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isDesktop) {
    return (
      <ScrollView
        className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', padding: 48 }}
      >
        <View style={{ width: '100%', maxWidth: 1200 }}>
          <BackButton />
          <View className="flex-row gap-16 items-start mt-0">
            {/* Split Izquierdo: Hero del Producto */}
            <View className="flex-1 gap-8">
              <View
                className="rounded-[32px] overflow-hidden bg-white dark:bg-[#1A1F2B]"
                style={{
                  aspectRatio: 1,
                  boxShadow: Platform.OS === 'web' ? '0 24px 48px rgba(0,0,0,0.06)' : undefined,
                  elevation: Platform.OS !== 'web' ? 12 : undefined,
                }}
              >
                <ProductImageDisplay
                  uri={product.imagen}
                  hasImg={hasImg}
                  onError={() => setProductImageError(true)}
                  accessibilityLabel={`Imagen de ${product.nombre}`}
                />
              </View>

              {/* QR expandido en desktop editorial */}
              <View className="flex-row items-center gap-4 px-2">
                <View
                  className="p-3 bg-white dark:bg-[#1A1F2B] rounded-2xl"
                  style={{
                    boxShadow: Platform.OS === 'web' ? '0 4px 12px rgba(0,0,0,0.04)' : undefined,
                    elevation: Platform.OS !== 'web' ? 3 : undefined,
                  }}
                >
                  <QRCode value={product.id} size={80} />
                </View>
                <View>
                  <Text className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Identifier</Text>
                  <Text className="text-sm text-[#6B7280] font-mono mt-0.5">{product.id.substring(0, 12)}...</Text>
                </View>
              </View>
            </View>

            {/* Split Derecho: Info & Acciones */}
            <View style={{ width: 480 }} className="gap-8">
              <View>{infoSection}</View>

              <View className="gap-6">
                <View>
                  <Text
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] dark:text-[#5A6478] mb-3"
                    style={{ fontFamily: AppFonts.bodyStrong }}
                  >
                    Valuación Comercial
                  </Text>
                  <ProductPriceCard
                    precioVenta={product.precio_venta}
                    precioMayoreo={product.precio_mayoreo}
                    costoPromedio={product.costo_promedio}
                  />
                </View>

                <View>
                  <Text
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] dark:text-[#5A6478] mb-3"
                    style={{ fontFamily: AppFonts.bodyStrong }}
                  >
                    Estado de Inventario
                  </Text>
                  <ProductStockCard
                    cantidad={product.cantidad}
                    stockMinimo={product.stock_minimo}
                    isCritical={isCritical}
                  />
                </View>
              </View>

              <View className="mt-4">{actionButtons}</View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <BackButton />
        <View
          className="w-full rounded-[24px] overflow-hidden bg-white dark:bg-neutral-800"
          style={{
            aspectRatio: 1,
            boxShadow: Platform.OS === 'web' ? '0 12px 24px rgba(0,0,0,0.04)' : undefined,
            elevation: Platform.OS !== 'web' ? 8 : undefined,
          }}
        >
          <ProductImageDisplay
            uri={product.imagen}
            hasImg={hasImg}
            onError={() => setProductImageError(true)}
            accessibilityLabel={`Imagen de ${product.nombre}`}
          />
        </View>

        <View className="gap-1 pt-2">{infoSection}</View>

        <View className="gap-6 mt-4">
          <View>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] dark:text-[#5A6478] mb-3">COMERCIAL</Text>
            <ProductPriceCard
              precioVenta={product.precio_venta}
              precioMayoreo={product.precio_mayoreo}
              costoPromedio={product.costo_promedio}
            />
          </View>

          <View>
            <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] dark:text-[#5A6478] mb-3">INVENTARIO</Text>
            <ProductStockCard
              cantidad={product.cantidad}
              stockMinimo={product.stock_minimo}
              isCritical={isCritical}
            />
          </View>

          <View
            className="bg-white dark:bg-neutral-800 rounded-3xl p-6 items-center"
            style={{
              boxShadow: Platform.OS === 'web' ? '0 4px 12px rgba(0,0,0,0.04)' : undefined,
              elevation: Platform.OS !== 'web' ? 4 : undefined,
            }}
          >
             <QRCode value={product.id} size={140} />
             <Text className="text-[11px] font-medium tracking-tight text-gray-500 dark:text-gray-400 mt-4 uppercase">Escaneo de Producto</Text>
          </View>
        </View>
      </ScrollView>

      <View
        className="px-6 py-4 bg-[#FAFAF9] dark:bg-[#0C0F14] border-t border-gray-100 dark:border-neutral-800"
        style={{ paddingBottom: 16 + tabBarHeight }}
      >
        {actionButtons}
      </View>
    </View>
  );
}
