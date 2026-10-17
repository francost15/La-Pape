import AppTextInput from "@/components/ui/AppTextInput";
import { parseNumeric } from "@/constants/pagos";
import type { ProductFormFieldProps } from "@/interface/products";
import { Controller } from "react-hook-form";

/** Campo de texto/número canónico del formulario de producto (RHF + AppTextInput). */
export default function ProductFormField({
  control,
  name,
  label,
  numeric,
  containerStyle,
  keyboardType,
  ...inputProps
}: ProductFormFieldProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <AppTextInput
          {...inputProps}
          label={label}
          error={fieldState.error?.message}
          value={value == null ? "" : String(value)}
          onChangeText={(text) => onChange(numeric ? parseNumeric(text, numeric) : text)}
          onBlur={onBlur}
          containerStyle={containerStyle}
          keyboardType={
            numeric === "integer"
              ? "number-pad"
              : numeric === "decimal"
                ? "decimal-pad"
                : keyboardType
          }
        />
      )}
    />
  );
}
