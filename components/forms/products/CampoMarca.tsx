import { CreateProductFormData } from '@/lib';
import { useProductosStore } from '@/store/productos-store';
import { createElement, useMemo, useState } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CampoMarcaProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
}

export default function CampoMarca({ control, errors }: CampoMarcaProps) {
  const { products } = useProductosStore();
  const [showModal, setShowModal] = useState(false);
  const isWeb = Platform.OS === 'web';

  const availableBrands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map(p => p.marca?.trim())
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [products]);

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
        Marca
      </Text>
      <Controller
        control={control}
        name="marca"
        render={({ field: { onChange, value } }) => (
          <View className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg overflow-hidden">
            {isWeb ? (
              createElement(
                'select',
                {
                  value: value || '',
                  onChange: (e: any) => onChange(e.target.value),
                  className: 'w-full px-4 py-3 bg-transparent text-black dark:text-white border-none outline-none',
                  style: {
                    width: '100%',
                    padding: '12px 16px',
                  },
                },
                createElement(
                  'option',
                  {
                    value: '',
                    className: 'bg-white dark:bg-neutral-800 text-black dark:text-white',
                  },
                  'Selecciona una marca'
                ),
                ...availableBrands.map((brand) =>
                  createElement(
                    'option',
                    {
                      key: brand,
                      value: brand,
                      className: 'bg-white dark:bg-neutral-800 text-black dark:text-white',
                    },
                    brand
                  )
                )
              )
            ) : (
              <>
                <TouchableOpacity
                  className="px-4 py-3 flex-row justify-between items-center"
                  onPress={() => setShowModal(true)}
                >
                  <Text className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                    {value || 'Selecciona una marca'}
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500">▼</Text>
                </TouchableOpacity>
                <Modal
                  visible={showModal}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowModal(false)}
                >
                  <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-neutral-800 rounded-t-3xl p-6 max-h-[80%]">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-black dark:text-white">
                          Seleccionar Marca
                        </Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                          <Text className="text-orange-600 text-lg font-semibold">Cerrar</Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView>
                        {availableBrands.map((brand) => (
                    <TouchableOpacity
                      key={brand}
                            className={`p-4 mb-2 rounded-lg ${
                              value === brand
                                ? 'bg-orange-600'
                                : 'bg-gray-100 dark:bg-neutral-700'
                            }`}
                      onPress={() => {
                        onChange(brand);     
                              setShowModal(false);
                      }}
                    >
                            <Text
                              className={`${
                                value === brand
                                  ? 'text-white font-semibold'
                                  : 'text-black dark:text-white'
                              }`}
                            >
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
                  </View>
                </Modal>
              </>
            )}
          </View>
        )}
      />
      {errors.marca && (
        <Text className="text-red-500 text-xs mt-1">{errors.marca.message}</Text>
      )}
    </View>
  );
}
