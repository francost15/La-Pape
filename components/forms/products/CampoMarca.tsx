import { CreateProductFormData } from '@/lib';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

interface CampoMarcaProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
}

export default function CampoMarca({ control, errors }: CampoMarcaProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-2">
        Marca
      </Text>
      <Controller
        control={control}
        name="marca"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg px-4 py-3 text-black dark:text-white"
            placeholder="Ej: Faber-Castell"
            placeholderTextColor="#9ca3af"
            value={value || ''}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.marca && (
        <Text className="text-red-500 text-xs mt-1">{errors.marca.message}</Text>
      )}
    </View>
  );
}
