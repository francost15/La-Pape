import { Product } from '@/interface/products';
import { useVentasStore } from '@/store/ventas-store';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol } from '../ui/icon-symbol';

interface ProductItemVentaProps {
  product: Product;
  compact?: boolean;
  onProductAdded?: () => void;
}

export default function ProductItemVenta({
  product,
  compact = false,
  onProductAdded,
}: ProductItemVentaProps) {
  const addItem = useVentasStore((s) => s.addItem);
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 900);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  const handleAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addItem(product, 1);
    setJustAdded(true);
    buttonScale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
    onProductAdded?.();
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const hasImage = product.imagen?.trim();
  const isWeb = Platform.OS === 'web';

  if (compact) {
    return (
      <Pressable
          onPress={handleAdd}
          className="flex-row items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 active:opacity-80"
        >
        <View className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-neutral-700 overflow-hidden shrink-0">
          {hasImage && !imageError ? (
            <Image
              source={{ uri: product.imagen }}
              className="w-full h-full"
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <IconSymbol name="photo.fill" size={28} color="#9ca3af" />
            </View>
          )}
        </View>
        <View className="flex-1 min-w-0">
          <Text
            className="text-base font-medium text-gray-900 dark:text-white"
            numberOfLines={2}
          >
            {product.nombre}
          </Text>
          <Text className="text-base font-bold text-orange-600 mt-0.5">
            ${product.precio_venta.toLocaleString()}
          </Text>
        </View>
        <Animated.View
          style={[
            buttonAnimatedStyle,
            {
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: justAdded ? '#22c55e' : '#f97316',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <IconSymbol
            name={justAdded ? 'checkmark.circle.fill' : 'plus.circle.fill'}
            size={22}
            color="white"
          />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handleAdd}
      className="rounded-xl overflow-hidden bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 active:opacity-90"
    >
      <View
        className={`w-full bg-gray-200 dark:bg-neutral-700 overflow-hidden ${
          isWeb ? 'h-28' : 'h-24'
        }`}
      >
        {hasImage && !imageError ? (
          <Image
            source={{ uri: product.imagen }}
            className="w-full h-full"
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <IconSymbol name="photo.fill" size={32} color="#9ca3af" />
          </View>
        )}
      </View>
      <View className="p-3">
        <Text
          className="text-base font-medium text-gray-900 dark:text-white"
          numberOfLines={2}
        >
          {product.nombre}
        </Text>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-lg font-bold text-orange-600">
            ${product.precio_venta.toLocaleString()}
          </Text>
          <Animated.View
            style={[
              buttonAnimatedStyle,
              {
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: justAdded ? '#22c55e' : '#f97316',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <IconSymbol
              name={justAdded ? 'checkmark.circle.fill' : 'plus.circle.fill'}
              size={20}
              color="white"
            />
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}
