import FormProductos from '@/components/forms/FormProductos';
import { auth, CreateProductFormData, createProductSchema, getProductosScreenData } from '@/lib';
import { getCategoriasByNegocio } from '@/lib/services/categorias';
import { getProductById, updateProduct } from '@/lib/services/productos';
import { getNegocioIdByUsuario } from '@/lib/services/usuarios-negocios';
import { useProductosStore } from '@/store/productos-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function EditProduct() {
  const isWeb = Platform.OS === 'web';
  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();
  const router = useRouter();
  const { negocioId, categories, setNegocioId, setCategories, setProducts, currentProduct, setCurrentProduct } = useProductosStore();
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
          // Usar setTimeout para asegurar que el router esté montado
          setTimeout(() => {
            router.replace('/');
          }, 100);
          return;
        }

        // Cargar producto desde parámetros, store o Firestore
        let product = null;
        
        // Primero intentar desde parámetros
        if (productParam) {
          try {
            // Intentar decodificar primero (para URLs codificadas)
            product = JSON.parse(decodeURIComponent(productParam));
          } catch {
            // Si falla, intentar sin decode
            try {
              product = JSON.parse(productParam);
            } catch {
              // Continuar con otros métodos
            }
          }
        }
        
        // Si no está en parámetros, intentar desde el store
        if (!product && currentProduct && currentProduct.id === id) {
          product = currentProduct;
        }
        
        // Si aún no está, cargar desde Firestore
        if (!product && id) {
          product = await getProductById(id);
        }

        if (!product) {
          Alert.alert('Error', 'Producto no encontrado', [
            {
              text: 'OK',
              onPress: () => {
                // Usar setTimeout para asegurar que el router esté montado
                setTimeout(() => {
                  router.back();
                }, 100);
              },
            },
          ]);
          return;
        }

        // Cargar negocio y categorías
        const currentNegocioId = await getNegocioIdByUsuario(user.uid, user.email || '');
        if (!currentNegocioId) {
          Alert.alert('Error', 'No tienes un negocio asignado', [
            {
              text: 'OK',
              onPress: () => {
                // Usar setTimeout para asegurar que el router esté montado
                setTimeout(() => {
                  router.back();
                }, 100);
              },
            },
          ]);
          return;
        }

        setNegocioId(currentNegocioId);
        const categoriasData = await getCategoriasByNegocio(currentNegocioId);
        setCategories(categoriasData);

        // Resetear el formulario con los datos del producto
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
          stock_minimo: product.stock_minimo || 0,
        });
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Error al cargar los datos', [
          {
            text: 'OK',
            onPress: () => {
              // Usar setTimeout para asegurar que el router esté montado
              setTimeout(() => {
                router.back();
              }, 100);
            },
          },
        ]);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      // Preparar los datos para actualizar, convirtiendo cadenas vacías a null
      const updateData: any = {
        nombre: data.nombre,
        categoria_id: data.categoria_id,
        precio_venta: data.precio_venta,
        precio_mayoreo: data.precio_mayoreo,
        costo_promedio: data.costo_promedio,
        cantidad: data.cantidad,
      };

      // Campos opcionales: si están vacíos, enviar null para eliminarlos
      updateData.imagen = data.imagen && data.imagen.trim() !== '' ? data.imagen : null;
      updateData.descripcion = data.descripcion && data.descripcion.trim() !== '' ? data.descripcion : null;
      updateData.marca = data.marca && data.marca.trim() !== '' ? data.marca : null;
      updateData.stock_minimo = data.stock_minimo !== undefined && data.stock_minimo !== null ? data.stock_minimo : null;

      await updateProduct(id, updateData);

      // Refrescar los productos en el store
      const user = auth.currentUser;
      if (user) {
        const storeData = await getProductosScreenData(user.uid, user.email || '');
        setProducts(storeData.products);
      }

      // Actualizar el producto en el store (siempre actualizar, no solo si ya existe)
      const updatedProduct = await getProductById(id);
      if (updatedProduct) {
        setCurrentProduct(updatedProduct);
      }

      // Navegar de vuelta al detalle del producto
      // Usar back() en lugar de replace para mantener el historial de navegación
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo actualizar el producto');
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
          Editar Producto
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
              <Text className="text-center text-white font-semibold">Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
