import { CardProductsProps } from '@/interface/products';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function CardProducts({ product, className = '' }: CardProductsProps) {
  const isWeb = Platform.OS === 'web';
  const handlePress = () => {
    router.push({
      pathname: '/productos/producto/[id]' as any,
      params: {
        id: product.id,
        product: JSON.stringify(product),
      },
    });
  };
  return (
    <TouchableOpacity
    activeOpacity={0.8}
    // onpressin es el sonido de click
    onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    onPress={handlePress}
      className={`bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-md ${className}`}
    >
      <View className={`${isWeb ? 'h-48' : 'h-38'} w-full bg-gray-200 dark:bg-neutral-700 overflow-hidden`}>
        {product.imagen && product.imagen.trim() !== '' ? (
          <Image
            source={{ uri: product.imagen }}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
            onError={(error) => {
              if (__DEV__) {
                console.warn('Error al cargar imagen:', product.nombre, 'URL:', product.imagen, error);
              }
            }}
            onLoad={() => {
              if (__DEV__) {
                console.log('✓ Imagen cargada:', product.nombre);
              }
            }}
          />
        ) : (
          <View className="w-full h-full bg-gray-200 dark:bg-neutral-700 justify-center items-center">
            <Text className="text-gray-400 dark:text-gray-500 text-xs">Sin imagen</Text>
            {__DEV__ && product.imagen === undefined && (
              <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Campo imagen no existe
              </Text>
            )}
          </View>
        )}
      </View>

      <View className="p-2">
        <View className="flex-row justify-between items-center gap-2 mb-1">
          {product.marca && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {product.marca}
            </Text>
          )}
          {product.cantidad !== undefined && (
            <Text className={`text-xs ${product.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.cantidad > 0 ? `Stock: ${product.cantidad}` : 'Sin stock'}
            </Text>
          )}
        </View>
        <Text className={`${isWeb ? 'text-base' : 'text-sm'} font-semibold text-gray-900 dark:text-white mb-2`} numberOfLines={2}>
          {product.nombre}
        </Text>

        <View className="flex-row items-baseline gap-2">
          <Text className={`${isWeb ? 'text-lg' : 'text-base'} font-bold text-orange-600`}>
            ${product.precio_venta.toLocaleString()}
          </Text>
          <Text className={`${isWeb ? 'text-sm' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
            Mayoreo: ${product.precio_mayoreo.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
