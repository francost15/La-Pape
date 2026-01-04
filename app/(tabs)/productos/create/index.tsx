import FormProductos from '@/components/forms/FormProductos';
import { auth, CreateProductFormData, createProductSchema, getProductosScreenData } from '@/lib';
import { getCategoriasByNegocio } from '@/lib/services/categorias';
import { createProduct } from '@/lib/services/productos';
import { getNegocioIdByUsuario } from '@/lib/services/usuarios-negocios';
import { useProductosStore } from '@/store/productos-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function CreateProduct() {
  const isWeb = Platform.OS === 'web';
  const { negocioId, categories, setNegocioId, setCategories, setProducts } = useProductosStore();
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
          router.replace('/');
          return;
        }

        // Cargar negocio y categorías
        const currentNegocioId = await getNegocioIdByUsuario(user.uid, user.email || '');
        if (!currentNegocioId) {
          Alert.alert('Error', 'No tienes un negocio asignado');
          router.back();
          return;
        }

        setNegocioId(currentNegocioId);
        const categoriasData = await getCategoriasByNegocio(currentNegocioId);
        setCategories(categoriasData);
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Error al cargar los datos');
        router.back();
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: CreateProductFormData) => {
    if (!negocioId) {
      Alert.alert('Error', 'No tienes un negocio asignado');
      return;
    }

    try {
      setLoading(true);
      const productId = await createProduct({
        negocio_id: negocioId,
        nombre: data.nombre,
        categoria_id: data.categoria_id,
        precio_venta: data.precio_venta,
        precio_mayoreo: data.precio_mayoreo,
        costo_promedio: data.costo_promedio,
        cantidad: data.cantidad,
        imagen: data.imagen || undefined,
        descripcion: data.descripcion || undefined,
        marca: data.marca || undefined,
        stock_minimo: data.stock_minimo || undefined,
      });
      
      reset();
      
      // Refrescar los productos en el store para que se actualice la lista
      const user = auth.currentUser;
      if (user) {
        const storeData = await getProductosScreenData(user.uid, user.email || '');
        setProducts(storeData.products);
      }
      
      // Navegar directamente al producto creado
      router.replace(`/productos/producto/${productId}`);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo crear el producto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View className="flex-1 bg-gray-100 dark:bg-neutral-900 justify-center items-center">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-100 dark:bg-neutral-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: isWeb ? 24 : 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-black dark:text-white mb-2">
          Crear Producto
        </Text>

        <FormProductos
          control={control}
          errors={errors}
          categories={categories}
          isWeb={isWeb}
        />

        {/* Botones */}
        <View className={`flex-row gap-3 mt-6 ${isWeb ? 'justify-end' : ''}`}>
          <TouchableOpacity
            className="flex-1 bg-gray-300 dark:bg-neutral-700 px-6 py-3 rounded-lg"
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text className="text-center text-gray-700 dark:text-gray-300 font-semibold">
              Cancelar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-orange-600 px-6 py-3 rounded-lg"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-semibold">Crear Producto</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
