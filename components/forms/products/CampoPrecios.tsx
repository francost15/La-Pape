import { AppColors } from "@/constants/colors";
import { CreateProductFormData } from "@/lib";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

interface CampoPreciosProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
}

export default function CampoPrecios({ control, errors }: CampoPreciosProps) {
  return (
    <View className="flex-row gap-4">
      <View className="flex-1">
        <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Precio de Venta *
        </Text>
        <Controller
          control={control}
          name="precio_venta"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border bg-white dark:bg-neutral-800 ${
                errors.precio_venta ? "border-red-500" : "border-gray-300 dark:border-neutral-700"
              } rounded-lg px-4 py-3 text-black dark:text-white`}
              placeholder="0.00"
              placeholderTextColor={AppColors.light.textMuted}
              value={value.toString()}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              onBlur={onBlur}
              keyboardType="decimal-pad"
            />
          )}
        />
        {errors.precio_venta && (
          <Text className="mt-1 text-xs text-red-500">{errors.precio_venta.message}</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Precio Mayoreo *
        </Text>
        <Controller
          control={control}
          name="precio_mayoreo"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border bg-white dark:bg-neutral-800 ${
                errors.precio_mayoreo ? "border-red-500" : "border-gray-300 dark:border-neutral-700"
              } rounded-lg px-4 py-3 text-black dark:text-white`}
              placeholder="0.00"
              placeholderTextColor={AppColors.light.textMuted}
              value={value.toString()}
              onChangeText={(text) => onChange(parseFloat(text) || 0)}
              onBlur={onBlur}
              keyboardType="decimal-pad"
            />
          )}
        />
        {errors.precio_mayoreo && (
          <Text className="mt-1 text-xs text-red-500">{errors.precio_mayoreo.message}</Text>
        )}
      </View>
    </View>
  );
}
