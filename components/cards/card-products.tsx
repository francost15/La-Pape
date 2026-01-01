import { CardProductsProps } from '@/interface/products';
import * as Haptics from 'expo-haptics';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';

export default function CardProducts({ product, className = '' }: CardProductsProps) {
  const isWeb = Platform.OS === 'web';

  return (
    <TouchableOpacity
    activeOpacity={0.8}
    // onpressin es el sonido de click
    onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      className={`bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-md ${className}`}
    >
      <View className={`${isWeb ? 'h-48' : 'h-38'} w-full bg-gray-200 dark:bg-neutral-700`}>
        {product.imagen ? (
          <Image
            source={{ uri: product.imagen }}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <View className="w-full h-full bg-gray-200 dark:bg-neutral-700" />
        )}
      </View>

      <View className="p-2">
        {product.categoria && (
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {product.categoria.nombre}
          </Text>
        )}

        <Text className={`${isWeb ? 'text-base' : 'text-sm'} font-semibold text-gray-900 dark:text-white mb-2`} numberOfLines={2}>
          {product.nombre}
        </Text>

        <View className="flex-row items-baseline gap-2">
          <Text className={`${isWeb ? 'text-lg' : 'text-base'} font-bold text-blue-600 dark:text-blue-400`}>
            ${product.precio.toLocaleString()}
          </Text>
          <Text className={`${isWeb ? 'text-sm' : 'text-xs'} text-gray-500 dark:text-gray-400`}>
            Mayoreo: ${product.precio_mayoreo.toLocaleString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
