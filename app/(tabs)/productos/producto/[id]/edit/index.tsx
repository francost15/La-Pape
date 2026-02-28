import CampoImagen from '@/components/forms/products/CampoImagen';
import FormProductos from '@/components/forms/FormProductos';
import { auth, CreateProductFormData, createProductSchema, getProductosScreenData } from '@/lib';
import { getCategoriasByNegocio } from '@/lib/services/categorias';
import { notify } from '@/lib/notify';
import type { UpdateProductInput } from '@/interface';
import { getProductById, updateProduct } from '@/lib/services/productos';
import { getNegocioIdByUsuario } from '@/lib/services/usuarios-negocios';
import { useProductosStore } from '@/store/productos-store';
import { useSessionStore } from '@/store/session-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

export default function EditProduct() {
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const tabBarHeight = useBottomTabBarHeight();

  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();
  const router = useRouter();
  // negocioId viene del sessionStore (ya hidratado en login).
  // Solo se hace fallback a Firestore si por alguna razón no está disponible aún.
  const sessionNegocioId = useSessionStore((s) => s.negocioId);

  const {
    negocioId: storeNegocioId,
    categories,
    setNegocioId,
    setCategories,
    setProducts,
    currentProduct,
    setCurrentProduct,
  } = useProductosStore();

  const negocioId = sessionNegocioId ?? storeNegocioId;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      nombre: '',
      categoria_id: '',
      precio_venta: 0,
      precio_mayoreo: 0,
      costo_promedio: 0,
      cantidad: 0,
      imagen: '',
      descripcion: '',
      marca: '',
      stock_minimo: 0,
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setTimeout(() => router.replace('/'), 100);
          return;
        }

        let product = null;

        if (productParam) {
          try {
            product = JSON.parse(decodeURIComponent(productParam));
          } catch {
            try {
              product = JSON.parse(productParam);
            } catch {
              /* continuar */
            }
          }
        }

        if (!product && currentProduct && currentProduct.id === id) {
          product = currentProduct;
        }

        if (!product && id) {
          product = await getProductById(id);
        }

        if (!product) {
          Alert.alert('Error', 'Producto no encontrado', [
            { text: 'OK', onPress: () => setTimeout(() => router.back(), 100) },
          ]);
          return;
        }

        // Usar negocioId del sessionStore si está disponible — evita un round-trip a Firestore
        const currentNegocioId =
          negocioId ?? (await getNegocioIdByUsuario(user.uid, user.email || ''));

        if (!currentNegocioId) {
          Alert.alert('Error', 'No tienes un negocio asignado', [
            { text: 'OK', onPress: () => setTimeout(() => router.back(), 100) },
          ]);
          return;
        }

        if (!negocioId) setNegocioId(currentNegocioId);

        // Cargar categorías solo si el store no las tiene (ya cargadas desde la lista de productos)
        if (categories.length === 0) {
          const categoriasData = await getCategoriasByNegocio(currentNegocioId);
          setCategories(categoriasData);
        }

        reset({
          nombre: product.nombre || '',
          categoria_id: product.categoria_id || '',
          precio_venta: product.precio_venta || 0,
          precio_mayoreo: product.precio_mayoreo || 0,
          costo_promedio: product.costo_promedio || 0,
          cantidad: product.cantidad || 0,
          imagen: product.imagen || '',
          descripcion: product.descripcion || '',
          marca: product.marca || '',
          stock_minimo: product.stock_minimo ?? 0,
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Error al cargar los datos';
        Alert.alert('Error', msg, [
          { text: 'OK', onPress: () => setTimeout(() => router.back(), 100) },
        ]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  // negocioId y categories se leen del store pero no son deps de init (no deben retriggerar)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, productParam, reset, router]);

  const onSubmit = async (data: CreateProductFormData) => {
    if (!id) {
      Alert.alert('Error', 'Id del producto no encontrado');
      return;
    }
    if (!negocioId) {
      Alert.alert('Error', 'No tienes un negocio asignado');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        nombre: data.nombre,
        categoria_id: data.categoria_id,
        precio_venta: data.precio_venta,
        precio_mayoreo: data.precio_mayoreo,
        costo_promedio: data.costo_promedio,
        cantidad: data.cantidad,
        imagen: data.imagen?.trim() ? data.imagen : null,
        descripcion: data.descripcion?.trim() ? data.descripcion : null,
        marca: data.marca?.trim() ? data.marca : null,
        stock_minimo: data.stock_minimo != null ? data.stock_minimo : null,
      } as UpdateProductInput;

      await updateProduct(id, updateData);

      const user = auth.currentUser;
      if (user) {
        const storeData = await getProductosScreenData(user.uid, user.email || '');
        setProducts(storeData.products);
      }

      const updatedProduct = await getProductById(id);
      if (updatedProduct) setCurrentProduct(updatedProduct);

      notify.success({ title: 'Producto actualizado' });
      router.back();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'No se pudo actualizar el producto';
      notify.error({ title: 'Error', description: msg });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-neutral-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando...</Text>
      </View>
    );
  }

  const actionButtons = (
    <View className="flex-row gap-2">
      <TouchableOpacity
        className="h-11 px-4 rounded-xl border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 flex-row items-center justify-center active:opacity-80"
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 h-11 bg-orange-600 rounded-xl flex-row items-center justify-center gap-2 active:opacity-80"
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-white font-semibold text-[15px]">Guardar Cambios</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (isDesktop) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50 dark:bg-neutral-900"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ alignItems: 'center', padding: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth: 1100 }} className="flex-row gap-10 items-start">
            {/* Columna izquierda: imagen — mismo estilo que vista detalle */}
            <View
              className="rounded-3xl overflow-hidden bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 shrink-0"
              style={{ width: 420 }}
            >
              <CampoImagen
                control={control}
                errors={errors}
                isWeb={isWeb}
                previewSize={{ width: 420, height: 420 }}
              />
            </View>

            {/* Columna derecha: formulario */}
            <View className="flex-1 gap-4">
              <FormProductos
                control={control}
                errors={errors}
                categories={categories}
                isWeb={isWeb}
                hideImage
              />
              {actionButtons}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-neutral-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormProductos
          control={control}
          errors={errors}
          categories={categories}
          isWeb={isWeb}
        />
      </ScrollView>

      <View
        className="px-4 py-3 bg-gray-50 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800"
        style={{ paddingBottom: 12 + tabBarHeight }}
      >
        {actionButtons}
      </View>
    </KeyboardAvoidingView>
  );
}
