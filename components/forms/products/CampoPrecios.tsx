import { CreateProductFormData } from '@/lib';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

interface CampoPreciosProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
}

export default function CampoPrecios({ control, errors }: CampoPreciosProps) {
  return (
    <View className="flex-row gap-4">
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
          Precio de Venta *
        </Text>
        <Controller
          control={control}
          name="precio_venta"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`bg-white dark:bg-neutral-800 border ${
                errors.precio_venta
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-neutral-700'
              } rounded-lg px-4 py-3 text-black dark:text-white`}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              value={value.toString()}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              onBlur={onBlur}
              keyboardType="decimal-pad"
            />
          )}
        />
        {errors.precio_venta && (
          <Text className="text-red-500 text-xs mt-1">{errors.precio_venta.message}</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
          Precio Mayoreo *
        </Text>
        <Controller
          control={control}
          name="precio_mayoreo"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`bg-white dark:bg-neutral-800 border ${
                errors.precio_mayoreo
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-neutral-700'
              } rounded-lg px-4 py-3 text-black dark:text-white`}
              placeholder="0.00"
              placeholderTextColor="#9ca3af"
              value={value.toString()}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              onBlur={onBlur}
              keyboardType="decimal-pad"
            />
          )}
        />
        {errors.precio_mayoreo && (
          <Text className="text-red-500 text-xs mt-1">{errors.precio_mayoreo.message}</Text>
        )}
      </View>
    </View>
  );
}
