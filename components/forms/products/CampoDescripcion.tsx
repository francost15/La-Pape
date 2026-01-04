import { CreateProductFormData } from '@/lib';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

interface CampoDescripcionProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
}

export default function CampoDescripcion({ control, errors }: CampoDescripcionProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
        Descripción
      </Text>
      <Controller
        control={control}
        name="descripcion"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-black dark:text-white"
            placeholder="Descripción del producto..."
            placeholderTextColor="#9ca3af"
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        )}
      />
      {errors.descripcion && (
        <Text className="text-red-500 text-xs mt-1">{errors.descripcion.message}</Text>
      )}
    </View>
  );
}
