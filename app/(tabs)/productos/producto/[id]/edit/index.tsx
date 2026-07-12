import { EditProductView } from "@/components/products/edit/EditProductView";
import { DetailSkeleton } from "@/components/ui/skeletons";
import { useEditProduct } from "@/hooks/use-edit-product";

export default function EditProduct() {
  const { control, errors, categories, loading, loadingData, submit, goBack } = useEditProduct();

  if (loadingData) {
    return <DetailSkeleton variant="form" />;
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
