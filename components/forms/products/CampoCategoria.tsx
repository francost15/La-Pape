import { SelectField, type SelectOption } from "@/components/forms/SelectField";
import type { CampoCategoriaProps } from "@/interface/products";
import { useMemo } from "react";

export default function CampoCategoria({ control, errors, categories }: CampoCategoriaProps) {
  const options = useMemo<SelectOption[]>(
    () => categories.map((c) => ({ value: c.id, label: c.nombre })),
    [categories]
  );

  return (
    <SelectField
      control={control}
      name="categoria_id"
      label="Categoría *"
      options={options}
      placeholder="Selecciona una categoría"
      error={errors.categoria_id?.message}
    />
  );
}
