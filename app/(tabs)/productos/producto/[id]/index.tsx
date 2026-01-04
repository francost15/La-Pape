import { Product } from '@/interface/products';
import { getProductById } from '@/lib/services/productos';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

export default function ProductoById() {
  const { id, product: productParam } = useLocalSearchParams<{ id: string; product?: string }>();
  const navigation = useNavigation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar producto desde parámetros o Firestore
  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Intentar parsear desde parámetros primero
        if (productParam) {
          const parsedProduct = JSON.parse(productParam);
          setProduct(parsedProduct);
          setLoading(false);
          return;
        }

        // Si no hay en params, cargar desde Firestore
        if (id) {
          const productData = await getProductById(id);
          setProduct(productData);
        }
      } catch (error) {
        console.error('Error al cargar producto:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, productParam]);

  useEffect(() => {
    // Actualizar el título cuando se carga el producto
    if (product?.nombre) {
      navigation.setOptions({
        title: product.nombre,
      });
    }
  }, [product?.nombre, navigation]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-500 dark:text-gray-400 mt-4">Cargando producto...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-neutral-900">
        <Text className="text-lg text-gray-500 dark:text-gray-400">Producto no encontrado</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold text-black dark:text-white mb-4">{product.nombre}</Text>
      
      {product.imagen && product.imagen.trim() !== '' ? (
        <View className="w-full h-64 bg-gray-200 dark:bg-neutral-700 rounded-lg mb-4 overflow-hidden">
          <Image
            source={{ uri: product.imagen }}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
            onError={() => {
              console.warn('Error al cargar imagen del producto:', product.nombre);
            }}
          />
        </View>
      ) : (
        <View className="w-full h-64 bg-gray-200 dark:bg-neutral-700 rounded-lg mb-4 justify-center items-center">
          <Text className="text-gray-400 dark:text-gray-500">Sin imagen</Text>
        </View>
      )}
      
      {product.descripcion && (
        <Text className="text-base text-gray-600 dark:text-gray-400 mb-2">{product.descripcion}</Text>
      )}
      
      <View className="bg-white dark:bg-neutral-800 p-4 rounded-lg mb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Precio de Venta:</Text>
          <Text className="text-xl font-bold text-orange-600">${product.precio_venta.toLocaleString()}</Text>
        </View>
        
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Precio Mayoreo:</Text>
          <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300">${product.precio_mayoreo.toLocaleString()}</Text>
        </View>
        
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Costo Promedio:</Text>
          <Text className="text-base text-gray-700 dark:text-gray-300">${product.costo_promedio.toLocaleString()}</Text>
        </View>
        
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Cantidad en Stock:</Text>
          <Text className={`text-lg font-semibold ${product.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.cantidad}
          </Text>
        </View>
        
        {product.marca && (
          <View className="flex-row justify-between items-center">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Marca:</Text>
            <Text className="text-base text-gray-700 dark:text-gray-300">{product.marca}</Text>
          </View>
        )}
      </View>
      
      <View className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-lg">
        <Text className="text-xs text-gray-500 dark:text-gray-400">ID del Producto (Código de Barras):</Text>
        <Text className="text-sm font-mono text-gray-700 dark:text-gray-300">{product.id}</Text>
      </View>
    </View>
  );
}
