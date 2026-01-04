import { IconSymbol } from '@/components/ui/icon-symbol';
import { auth, getProductosScreenData } from '@/lib';
import { deleteProduct, getProductById } from '@/lib/services/productos';
import { useProductosStore } from '@/store/productos-store';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProductoById() {
  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();
  const navigation = useNavigation();
  const router = useRouter();
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

  // Cargar producto desde parámetros, store o Firestore
  useFocusEffect(
    useCallback(() => {
      if (!id) return;

      let isMounted = true;
      let isLoading = false;
      
      const loadProduct = async () => {
        // Evitar múltiples cargas simultáneas
        if (isLoading) return;
        isLoading = true;

        try {
          setProductImageError(false);
          
          // Si hay parámetros, usarlos primero
          if (productParam) {
            try {
              const parsedProduct = JSON.parse(productParam);
              if (isMounted && parsedProduct) {
                setCurrentProduct(parsedProduct);
                setProductLoading(false);
                isLoading = false;
                return;
              }
            } catch (error) {
              console.error('Error al parsear producto desde parámetros:', error);
              // Continuar con otros métodos si falla el parseo
            }
          }

          // Obtener el producto actual del store
          const currentProductFromStore = useProductosStore.getState().currentProduct;
          
          // Si el producto está en el store y coincide con el ID, usarlo
          // pero siempre verificar desde Firestore para asegurar datos actualizados
          if (currentProductFromStore && currentProductFromStore.id === id) {
            // Ya tenemos el producto, asegurarnos de que loading esté en false
            setProductLoading(false);
            isLoading = false;
            
            // Actualizar en segundo plano sin bloquear la UI
            getProductById(id)
              .then((updatedProduct) => {
                if (isMounted && updatedProduct) {
                  setCurrentProduct(updatedProduct);
                }
              })
              .catch((error) => {
                console.error('Error al actualizar producto en segundo plano:', error);
              });
            return;
          }

          // Si no tenemos el producto en el store, cargarlo desde Firestore
          setProductLoading(true);
          
          try {
            const productData = await getProductById(id);
            if (isMounted && productData) {
              setCurrentProduct(productData);
            } else if (isMounted) {
              // Si no se encontró el producto, limpiar el estado
              setCurrentProduct(null);
            }
          } catch (error) {
            console.error('Error al cargar producto desde Firestore:', error);
            if (isMounted) {
              setCurrentProduct(null);
            }
          }
        } catch (error) {
          console.error('Error al cargar producto:', error);
          if (isMounted) {
            setCurrentProduct(null);
          }
        } finally {
          if (isMounted) {
            setProductLoading(false);
          }
          isLoading = false;
        }
      };

      loadProduct();

      return () => {
        isMounted = false;
      };
    }, [id, productParam, setCurrentProduct, setProductLoading, setProductImageError])
  );

  // Limpiar cuando el componente se desmonte completamente
  useEffect(() => {
    return () => {
      // Solo resetear si realmente se desmonta (no cuando solo pierde el foco)
      // Esto se maneja mejor con un flag, pero por ahora lo dejamos así
    };
  }, []);

  useEffect(() => {
    // Actualizar el título cuando se carga el producto
    if (product?.nombre) {
      navigation.setOptions({
        title: product.nombre,
      });
    }
  }, [product?.nombre, navigation]);

  if (loading && !product) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando producto...</Text>
      </View>
    );
  }

  // Solo mostrar "no encontrado" si no está cargando y no hay producto
  if (!loading && !product) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-neutral-900">
        <Text className="text-lg text-gray-500 dark:text-gray-400">Producto no encontrado</Text>
      </View>
    );
  }

  // Si está cargando pero tenemos un producto (del store), mostrarlo mientras se actualiza
  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando producto...</Text>
      </View>
    );
  }

  const handleEdit = () => {
    router.push(`/productos/producto/${product.id}/edit` as any);
  };

  const handleDelete = () => {
    if (!product) return;

    Alert.alert(
      'Confirmar Eliminación',
      `¿Estás seguro de que deseas eliminar el producto "${product.nombre}"? Esta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteProduct(product.id);

              // Refrescar la lista de productos en el store
              const user = auth.currentUser;
              if (user) {
                const storeData = await getProductosScreenData(user.uid, user.email || '');
                setProducts(storeData.products);
              }

              // Limpiar el producto actual del store
              setCurrentProduct(null);

              // Navegar de vuelta a la lista de productos
              router.replace('/productos' as any);
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'No se pudo eliminar el producto');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100 dark:bg-neutral-900">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Imagen del producto */}
        {product.imagen && product.imagen.trim() !== '' && !imageError ? (
          <View className="w-full h-72 bg-gray-200 dark:bg-neutral-700 rounded-xl mb-4 overflow-hidden shadow-lg">
            <Image
              source={{ uri: product.imagen }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              onError={(error) => {
                setProductImageError(true);
              }}
            />
          </View>
        ) : (
          <View className="w-full h-72 bg-gray-200 dark:bg-neutral-700 rounded-xl mb-4 justify-center items-center shadow-lg">
            <IconSymbol name="photo.fill" size={48} color="#9ca3af" />
            <Text className="text-gray-400 dark:text-gray-500 mt-2">
              {imageError ? 'Error al cargar imagen' : 'Sin imagen'}
            </Text>
          </View>
        )}

        {/* Nombre del producto */}
        <View className="mb-4">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{product.nombre}</Text>
          {product.marca && (
            <Text className="text-base text-gray-500 dark:text-gray-400">{product.marca}</Text>
          )}
        </View>

        {/* Categoría y Descripción */}
        {(product.categoria_id || product.descripcion) && (
          <View className="bg-white dark:bg-neutral-800 p-4 rounded-xl mb-4 shadow-sm">
            {product.categoria_id && categories.find((c) => c.id === product.categoria_id) && (
              <>
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categoría</Text>
                <Text className="text-base text-gray-600 dark:text-gray-400 leading-5 mb-4">
                  {categories.find((c) => c.id === product.categoria_id)?.nombre || 'Sin categoría'}
                </Text>
              </>
            )}
            {product.descripcion && (
              <>
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción</Text>
                <Text className="text-base text-gray-600 dark:text-gray-400 leading-5">{product.descripcion}</Text>
              </>
            )}
          </View>
        )}


        {/* Información de precios */}
        <View className="bg-white dark:bg-neutral-800 p-4 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Información de Precios</Text>
          
          <View className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-neutral-700">
            <Text className="text-sm text-gray-600 dark:text-gray-400">Precio de Venta</Text>
            <Text className="text-xl font-bold text-orange-600">${product.precio_venta.toLocaleString()}</Text>
          </View>
          
          <View className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-neutral-700">
            <Text className="text-sm text-gray-600 dark:text-gray-400">Precio Mayoreo</Text>
            <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300">${product.precio_mayoreo.toLocaleString()}</Text>
          </View>
          
          <View className="flex-row justify-between items-center py-3">
            <Text className="text-sm text-gray-600 dark:text-gray-400">Costo Promedio</Text>
            <Text className="text-base font-medium text-gray-700 dark:text-gray-300">${product.costo_promedio.toLocaleString()}</Text>
          </View>
        </View>

        {/* Información de inventario */}
        <View className="bg-white dark:bg-neutral-800 p-4 rounded-xl mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Inventario</Text>
          
          <View className="flex-row justify-between items-center py-3 border-b border-gray-200 dark:border-neutral-700">
            <Text className="text-sm text-gray-600 dark:text-gray-400">Cantidad en Stock</Text>
            <View className="flex-row items-center gap-2">
              <View className={`px-3 py-1 rounded-full ${product.cantidad > (product.stock_minimo || 0) ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <Text className={`text-lg font-bold ${product.cantidad > (product.stock_minimo || 0) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.cantidad}
                </Text>
              </View>
            </View>
          </View>
          
          {product.stock_minimo !== undefined && product.stock_minimo !== null && (
            <View className="flex-row justify-between items-center py-3">
              <Text className="text-sm text-gray-600 dark:text-gray-400">Stock Mínimo</Text>
              <View className="flex-row items-center gap-1">
                <Text className={`text-lg font-medium ${product.cantidad <= product.stock_minimo ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {product.stock_minimo}
                </Text>
                {product.cantidad <= product.stock_minimo && (
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#ea580c" />
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botones de acción fijos en la parte inferior */}
      <View className="p-4 bg-gray-100 dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 gap-3">
        <TouchableOpacity
          className="bg-orange-600 px-6 py-4 rounded-xl flex-row items-center justify-center gap-2 shadow-lg"
          onPress={handleEdit}
          disabled={deleting}
        >
          <IconSymbol name="pencil.circle.fill" size={20} color="white" />
          <Text className="text-white font-semibold text-lg">Editar Producto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-600 px-6 py-4 rounded-xl flex-row items-center justify-center gap-2 shadow-lg"
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <IconSymbol name="trash.fill" size={20} color="white" />
              <Text className="text-white font-semibold text-lg">Eliminar Producto</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
