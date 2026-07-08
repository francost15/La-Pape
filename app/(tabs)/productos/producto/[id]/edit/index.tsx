import { EditProductView } from "@/components/products/edit/EditProductView";
import { AppColors } from "@/constants/colors";
import { useEditProduct } from "@/hooks/use-edit-product";
import { ActivityIndicator, Text, View } from "react-native";

export default function EditProduct() {
  const { control, errors, categories, loading, loadingData, submit, goBack } = useEditProduct();

  if (loadingData) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAF9] dark:bg-[#0C0F14]">
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text className="mt-4 text-[#6B7280] dark:text-[#9CA3AF]">Cargando datos...</Text>
      </View>
    );
  }

  return (
    <EditProductView
      control={control}
      errors={errors}
      categories={categories}
      loading={loading}
      onSave={submit}
      onCancel={goBack}
    />
  );
}
