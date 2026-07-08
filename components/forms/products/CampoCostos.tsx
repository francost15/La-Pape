import { AppColors } from "@/constants/colors";
import type { CampoCostosProps } from "@/interface/products";
import { Controller } from "react-hook-form";
import { Text, TextInput, View } from "react-native";

export default function CampoCostos({ control, errors }: CampoCostosProps) {
  return (
    <View className="flex-row gap-4">
      <View className="flex-1">
        <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Costo Promedio *
        </Text>
        <Controller
          control={control}
          name="costo_promedio"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border bg-white dark:bg-neutral-800 ${
                errors.costo_promedio ? "border-red-500" : "border-gray-300 dark:border-neutral-700"
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
        {errors.costo_promedio && (
          <Text className="mt-1 text-xs text-red-500">{errors.costo_promedio.message}</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Cantidad en Stock *
        </Text>
        <Controller
          control={control}
          name="cantidad"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border bg-white dark:bg-neutral-800 ${
                errors.cantidad ? "border-red-500" : "border-gray-300 dark:border-neutral-700"
              } rounded-lg px-4 py-3 text-black dark:text-white`}
              placeholder="0"
              placeholderTextColor={AppColors.light.textMuted}
              value={value.toString()}
              onChangeText={(text) => onChange(parseInt(text) || 0)}
              onBlur={onBlur}
              keyboardType="number-pad"
            />
          )}
        />
        {errors.cantidad && (
          <Text className="mt-1 text-xs text-red-500">{errors.cantidad.message}</Text>
        )}
      </View>

      <View className="flex-1">
        <Text className="mt-2 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Stock Mínimo
        </Text>
        <Controller
          control={control}
          name="stock_minimo"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border bg-white dark:bg-neutral-800 ${
                errors.stock_minimo ? "border-red-500" : "border-gray-300 dark:border-neutral-700"
              } rounded-lg px-4 py-3 text-black dark:text-white`}
              placeholder="0"
              placeholderTextColor={AppColors.light.textMuted}
              value={value?.toString() || ""}
              onChangeText={(text) => onChange(parseInt(text) || 0)}
              onBlur={onBlur}
              keyboardType="number-pad"
            />
          )}
        />
        {errors.stock_minimo && (
          <Text className="mt-1 text-xs text-red-500">{errors.stock_minimo.message}</Text>
        )}
      </View>
    </View>
  );
}
