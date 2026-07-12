import type { FormProductosProps } from "@/interface/products";
import { View } from "react-native";
import CampoCategoria from "./products/CampoCategoria";
import CampoImagen from "./products/CampoImagen";
import CampoMarca from "./products/CampoMarca";
import ProductFormField from "./products/ProductFormField";

export default function FormProductos({
  control,
  errors,
  categories,
  isWeb = false,
  hideImage = false,
}: FormProductosProps) {
  return (
    <View className="gap-4">
      <ProductFormField
        control={control}
        name="nombre"
        label="Nombre del Producto *"
        placeholder="Ej: Lápiz HB #2"
      />

      <CampoCategoria control={control} errors={errors} categories={categories} isWeb={isWeb} />

      <View className="flex-row gap-4">
        <ProductFormField
          control={control}
          name="precio_venta"
          label="Precio de Venta *"
          placeholder="0.00"
          numeric="decimal"
          containerStyle={{ flex: 1 }}
        />
        <ProductFormField
          control={control}
          name="precio_mayoreo"
          label="Precio Mayoreo *"
          placeholder="0.00"
          numeric="decimal"
          containerStyle={{ flex: 1 }}
        />
      </View>

      <View className="flex-row gap-4">
        <ProductFormField
          control={control}
          name="costo_promedio"
          label="Costo Promedio *"
          placeholder="0.00"
          numeric="decimal"
          containerStyle={{ flex: 1 }}
        />
        <ProductFormField
          control={control}
          name="cantidad"
          label="Cantidad en Stock *"
          placeholder="0"
          numeric="integer"
          containerStyle={{ flex: 1 }}
        />
        <ProductFormField
          control={control}
          name="stock_minimo"
          label="Stock Mínimo"
          placeholder="0"
          numeric="integer"
          containerStyle={{ flex: 1 }}
        />
      </View>

      <CampoMarca control={control} errors={errors} />

      <ProductFormField
        control={control}
        name="descripcion"
        label="Descripción"
        placeholder="Descripción del producto..."
        multiline
        numberOfLines={3}
      />

      {hideImage ? null : <CampoImagen control={control} errors={errors} isWeb={isWeb} />}
    </View>
  );
}
