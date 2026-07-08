import { AppColors } from "@/constants/colors";
import { CreateProductFormData } from "@/lib";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

interface CampoNombreProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
}

export default function CampoNombre({ control, errors }: CampoNombreProps) {
  return (
    <View>
      <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        Nombre del Producto *
      </Text>
      <Controller
        control={control}
        name="nombre"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`border bg-white dark:bg-neutral-800 ${
              errors.nombre ? "border-red-500" : "border-gray-300 dark:border-neutral-700"
            } rounded-lg px-4 py-3 text-black dark:text-white`}
            placeholder="Ej: Lápiz HB #2"
            placeholderTextColor={AppColors.light.textMuted}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.nombre && <Text className="mt-1 text-xs text-red-500">{errors.nombre.message}</Text>}
    </View>
  );
}
