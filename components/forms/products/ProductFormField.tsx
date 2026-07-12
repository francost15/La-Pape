import AppTextInput from "@/components/ui/AppTextInput";
import type { CreateProductFormData } from "@/lib/validations/product-schema";
import { Controller, type Control, type FieldPath } from "react-hook-form";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";

type NumericMode = "decimal" | "integer";

interface Props extends Omit<TextInputProps, "value" | "onChangeText" | "onBlur"> {
  control: Control<CreateProductFormData>;
  name: FieldPath<CreateProductFormData>;
  label: string;
  /** Interpreta el valor como número (decimal o entero) */
  numeric?: NumericMode;
  containerStyle?: StyleProp<ViewStyle>;
}

function parseNumeric(text: string, mode: NumericMode): number {
  if (mode === "integer") return parseInt(text, 10) || 0;
  return parseFloat(text) || 0;
}

/** Campo de texto/número canónico del formulario de producto (RHF + AppTextInput). */
export default function ProductFormField({
  control,
  name,
  label,
  numeric,
  containerStyle,
  keyboardType,
  ...inputProps
}: Props) {
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
