import { AppColors } from "@/constants/colors";
import { CreateProductFormData } from "@/lib";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

interface CampoDescripcionProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
}

export default function CampoDescripcion({ control, errors }: CampoDescripcionProps) {
  return (
    <View>
      <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Descripción
      </Text>
      <Controller
        control={control}
        name="descripcion"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            placeholder="Descripción del producto..."
            placeholderTextColor={AppColors.light.textMuted}
            value={value || ""}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        )}
      />
      {errors.descripcion && (
        <Text className="mt-1 text-xs text-red-500">{errors.descripcion.message}</Text>
      )}
    </View>
  );
}
