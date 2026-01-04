import { Categoria } from '@/interface';
import { CreateProductFormData } from '@/lib/validations/product-schema';
import { Control, FieldErrors } from 'react-hook-form';
import { View } from 'react-native';
import CampoCategoria from './products/CampoCategoria';
import CampoCostos from './products/CampoCostos';
import CampoDescripcion from './products/CampoDescripcion';
import CampoImagen from './products/CampoImagen';
import CampoMarca from './products/CampoMarca';
import CampoNombre from './products/CampoNombre';
import CampoPrecios from './products/CampoPrecios';

interface FormProductosProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
  categories: Categoria[];
  isWeb?: boolean;
}

export default function FormProductos({
  control,
  errors,
  categories,
  isWeb = false,
}: FormProductosProps) {
  return (
    <View className="space-y-4">
      <CampoNombre control={control} errors={errors} />
      <CampoCategoria control={control} errors={errors} categories={categories} isWeb={isWeb} />
      <CampoPrecios control={control} errors={errors} />
      <CampoCostos control={control} errors={errors} />
      <CampoMarca control={control} errors={errors} />
      <CampoDescripcion control={control} errors={errors} />
      <CampoImagen control={control} errors={errors} isWeb={isWeb} />
    </View>
  );
}
