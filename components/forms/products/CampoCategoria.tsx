import { Categoria } from '@/interface';
import { CreateProductFormData } from '@/lib';
import { useState } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface CampoCategoriaProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
  categories: Categoria[];
  isWeb?: boolean;
}

export default function CampoCategoria({
  control,
  errors,
  categories,
  isWeb = false,
}: CampoCategoriaProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
        Categoría *
      </Text>
      <Controller
        control={control}
        name="categoria_id"
        render={({ field: { onChange, value } }) => (
          <View className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg overflow-hidden">
            {isWeb ? (
              <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-black dark:text-white border-none outline-none"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                }}
              >
                <option value="" className="bg-white dark:bg-neutral-800 text-black dark:text-white">
                  Selecciona una categoría
                </option>
                {categories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-white dark:bg-neutral-800 text-black dark:text-white"
                  >
                    {cat.nombre}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <TouchableOpacity
                  className="px-4 py-3 flex-row justify-between items-center"
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Text className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
                    {value
                      ? categories.find((c) => c.id === value)?.nombre || 'Selecciona una categoría'
                      : 'Selecciona una categoría'}
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500">▼</Text>
                </TouchableOpacity>
                <Modal
                  visible={showCategoryModal}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowCategoryModal(false)}
                >
                  <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-neutral-800 rounded-t-3xl p-6 max-h-[80%]">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-black dark:text-white">
                          Seleccionar Categoría
                        </Text>
                        <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                          <Text className="text-orange-600 text-lg font-semibold">Cerrar</Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView>
                        {categories.map((cat) => (
                          <TouchableOpacity
                            key={cat.id}
                            className={`p-4 mb-2 rounded-lg ${
                              value === cat.id
                                ? 'bg-orange-600'
                                : 'bg-gray-100 dark:bg-neutral-700'
                            }`}
                            onPress={() => {
                              onChange(cat.id);
                              setShowCategoryModal(false);
                            }}
                          >
                            <Text
                              className={`${
                                value === cat.id
                                  ? 'text-white font-semibold'
                                  : 'text-black dark:text-white'
                              }`}
                            >
                              {cat.nombre}
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
      {errors.categoria_id && (
        <Text className="text-red-500 text-xs mt-1">{errors.categoria_id.message}</Text>
      )}
    </View>
  );
}
