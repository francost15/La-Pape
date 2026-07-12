import { ProductoDetailView } from "@/components/products/detail/ProductoDetailView";
import { DetailSkeleton } from "@/components/ui/skeletons";
import { useProductoDetail } from "@/hooks/use-producto-detail";
import { Text, View } from "react-native";

export default function ProductoById() {
  const {
    product,
    loading,
    imageError,
    deleting,
    categories,
    setProductImageError,
    handleEdit,
    handleDelete,
  } = useProductoDetail();

  if (loading && !product) {
    return <DetailSkeleton variant="detail" />;
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FAFAF9] dark:bg-[#0C0F14]">
        <Text className="text-lg text-[#6B7280] dark:text-[#9CA3AF]">Producto no encontrado</Text>
      </View>
    );
  }

  const categoria = categories.find((c) => c.id === product.categoria_id);
  const hasImg = Boolean(product.imagen?.trim()) && !imageError;
  const isCritical = product.cantidad <= (product.stock_minimo ?? 0);

  return (
    <ProductoDetailView
      product={product}
      categoria={categoria}
      hasImg={hasImg}
      isCritical={isCritical}
      deleting={deleting}
      onImageError={() => setProductImageError(true)}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
