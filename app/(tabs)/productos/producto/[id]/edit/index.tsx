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
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useHaptic } from "@/hooks/use-haptic";
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppFonts } from '@/constants/typography';
import { AppColors } from '@/constants/colors';

export default function EditProduct() {
  const haptic = useHaptic();
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
      <View className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14] justify-center items-center">
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text className="text-[#6B7280] dark:text-[#9CA3AF] mt-4">Cargando datos...</Text>
      </View>
    );
  }

  const actionButtons = (
    <View className="flex-row gap-3">
      <TouchableOpacity
        className="h-12 px-6 rounded-full border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 flex-row items-center justify-center active:opacity-80"
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text className="text-gray-500 dark:text-gray-400 text-sm font-bold tracking-wide uppercase" style={{ fontFamily: AppFonts.bodyStrong }}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-1 h-12 bg-[#EA580C] rounded-full flex-row items-center justify-center gap-2 active:opacity-90"
        style={{ 
          boxShadow: Platform.OS === 'web' ? '0 8px 24px rgba(234, 88, 12, 0.3)' : undefined,
          elevation: Platform.OS !== 'web' ? 6 : undefined,
        }}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <IconSymbol name="checkmark" size={16} color="white" />
            <Text 
              className="text-white font-bold text-[14px] tracking-widest"
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              GUARDAR CAMBIOS
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const BackButton = () => (
    <Pressable
      onPress={() => {
        haptic();
        router.back();
      }}
      className="flex-row items-center gap-2 mb-6 active:opacity-70"
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

  if (isDesktop) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14]"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ alignItems: 'center', padding: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth: 1200 }}>
            <BackButton />
            <View className="flex-row gap-16 items-start">
              {/* Columna izquierda: Imagen hero */}
              <View className="flex-1 gap-6">
                 <View className="bg-white dark:bg-neutral-800 rounded-[32px] overflow-hidden" style={{ boxShadow: Platform.OS === 'web' ? '0 24px 48px rgba(0,0,0,0.06)' : undefined }}>
                   <CampoImagen
                      control={control}
                      errors={errors}
                      isWeb={isWeb}
                      previewSize={{ width: 480, height: 480 }}
                    />
                 </View>
                 <View className="px-2">
                    <Text className="text-[10px] font-bold tracking-[0.2em] text-[#9CA3AF] uppercase mb-1">Guas de Edición</Text>
                    <Text className="text-xs text-gray-400 leading-4">Actualiza la imagen del producto cargando un archivo o ingresando una URL directa.</Text>
                 </View>
              </View>

              {/* Columna derecha: Formulario */}
              <View style={{ width: 480 }} className="gap-8">
                <View>
                  <Text className="text-2xl tracking-tight text-[#111827] dark:text-[#F9FAFB] mb-1" style={{ fontFamily: AppFonts.display }}>Editor de Producto</Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">Actualiza los detalles técnicos y comerciales.</Text>
                </View>

                <FormProductos
                  control={control}
                  errors={errors}
                  categories={categories}
                  isWeb={isWeb}
                  hideImage
                />
                
                <View className="mt-4">{actionButtons}</View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14]"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <BackButton />
        <View className="mb-6">
          <Text className="text-3xl tracking-tighter text-[#111827] dark:text-[#F9FAFB]" style={{ fontFamily: AppFonts.display }}>Editar</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Modifica los campos necesarios para reflejar los cambios.</Text>
        </View>

        <FormProductos
          control={control}
          errors={errors}
          categories={categories}
          isWeb={isWeb}
        />
      </ScrollView>

      <View
        className="px-6 py-4 bg-[#FAFAF9] dark:bg-[#0C0F14] border-t border-gray-100 dark:border-neutral-800"
        style={{ paddingBottom: 16 + tabBarHeight }}
      >
        {actionButtons}
      </View>
    </KeyboardAvoidingView>
  );
}
