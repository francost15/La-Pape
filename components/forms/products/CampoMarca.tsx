import { SelectField, type SelectOption } from "@/components/forms/SelectField";
import type { ProductFormFieldProps } from "@/interface/products";
import { useProductosStore } from "@/store/productos-store";
import { useMemo } from "react";

export default function CampoMarca({ control, errors }: ProductFormFieldProps) {
  const products = useProductosStore((s) => s.products);

  const options = useMemo<SelectOption[]>(() => {
    const brands = Array.from(
      new Set(products.map((p) => p.marca?.trim()).filter(Boolean) as string[])
    ).sort();
    return brands.map((b) => ({ value: b, label: b }));
  }, [products]);

  return (
    <SelectField
      control={control}
      name="marca"
      label="Marca"
      options={options}
      placeholder="Selecciona una marca"
      error={errors.marca?.message}
    />
  );
}
