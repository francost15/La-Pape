import type { Categoria } from "@/interface/categorias";
import type { ThemeColors } from "@/interface/theme";
import type { CreateProductFormData } from "@/lib/validations/product-schema";
import type { Control, FieldErrors } from "react-hook-form";
import type { StyleProp, ViewStyle } from "react-native";

// Producto - El ID se usará como código de barras
export interface Product {
  id: string; // UUID - Se usa como código de barras
  negocio_id: string;
  nombre: string; // varchar(80)
  categoria_id: string; // FK a Categorias
  precio_venta: number; // float
  precio_mayoreo: number; // float
  costo_promedio: number; // float
  cantidad: number; // int
  imagen?: string;
  descripcion?: string;
  marca?: string;
  stock_minimo?: number; // Para alertas
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProductInput {
  negocio_id: string;
  nombre: string;
  categoria_id: string;
  precio_venta: number;
  precio_mayoreo: number;
  costo_promedio: number;
  cantidad: number;
  imagen?: string;
  descripcion?: string;
  marca?: string;
  stock_minimo?: number; // esto es para alertas de stock
  activo?: boolean;
}

export interface UpdateProductInput {
  nombre?: string;
  categoria_id?: string;
  precio_venta?: number;
  precio_mayoreo?: number;
  costo_promedio?: number;
  cantidad?: number;
  imagen?: string;
  descripcion?: string;
  marca?: string;
  stock_minimo?: number;
  activo?: boolean;
}

export interface CardProductsProps {
  product: Product;
  onPress?: () => void;
  className?: string;
  /** Variante "ranking": muestra cantidad vendida y total en vez de stock/precio. */
  variant?: "default" | "ranking" | "stock";
  rankingData?: { cantidad: number; total: number };
  /** Índice en el ranking (1-based), se muestra como badge cuando variant=ranking */
  rank?: number;
  /** Datos para variante stock: cantidad actual y stock mínimo (se usa product si no se pasa) */
  stockData?: { cantidad: number; stockMinimo: number };
}

/** Props base compartidas por campos de formulario de producto (RHF). */
export interface ProductFormFieldProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
}

export interface CampoNombreProps extends ProductFormFieldProps {}

export interface CampoPreciosProps extends ProductFormFieldProps {}

export interface CampoDescripcionProps extends ProductFormFieldProps {}

export interface CampoCategoriaProps extends ProductFormFieldProps {
  categories: Categoria[];
  isWeb?: boolean;
}

export interface CampoMarcaProps extends ProductFormFieldProps {}

export interface CampoCostosProps extends ProductFormFieldProps {}

export interface CampoImagenProps extends ProductFormFieldProps {
  isWeb?: boolean;
  /** Tamaño fijo del preview en layout tipo detalle (ej. 420x420 desktop) */
  previewSize?: { width: number; height: number };
}

export interface FormProductosProps extends ProductFormFieldProps {
  categories: Categoria[];
  isWeb?: boolean;
  /** Cuando true, no se renderiza el campo imagen (para layouts que lo ubican aparte) */
  hideImage?: boolean;
}

export interface ProductPriceCardProps {
  precioVenta: number;
  precioMayoreo: number;
  costoPromedio: number;
}

export interface ProductImageDisplayProps {
  uri: string | undefined;
  hasImg: boolean;
  onError: () => void;
  accessibilityLabel?: string;
}

export interface ProductStockCardProps {
  cantidad: number;
  stockMinimo: number | null | undefined;
  isCritical: boolean;
}

export interface ProductoInfoProps {
  product: Product;
  categoria?: Pick<Categoria, "nombre">;
}

export interface ProductoDetailViewProps {
  product: Product;
  categoria?: Pick<Categoria, "nombre">;
  hasImg: boolean;
  isCritical: boolean;
  deleting: boolean;
  onImageError: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface ProductoActionsProps {
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export interface EditProductActionsProps {
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export interface EditProductViewProps {
  control: Control<CreateProductFormData>;
  errors: FieldErrors<CreateProductFormData>;
  categories: Categoria[];
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export interface ProductThumbProps {
  uri?: string;
  hasImage: boolean;
  imageError: boolean;
  onError: () => void;
  iconSize: number;
  fallbackColor: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export interface CardProductDesktopProps {
  product: Product;
  isDark: boolean;
  colors: ThemeColors;
  hasImage: boolean;
  imageError: boolean;
  onImageError: () => void;
  onPress: () => void;
  onPressIn: () => void;
}

export interface CardProductCompactProps {
  mode: "stock" | "ranking" | "mobile";
  product: Product;
  isDark: boolean;
  colors: ThemeColors;
  hasImage: boolean;
  imageError: boolean;
  onImageError: () => void;
  onPress: () => void;
  rankingData?: { cantidad: number; total: number };
  rank?: number | null;
  stockData?: { cantidad?: number; stockMinimo?: number };
}

export interface BadgeCategoryProductsProps {
  categories: Categoria[];
  orderBy?: "asc" | "desc";
  selectedCategoryId?: string | null;
  onCategoryPress: (categoryId: string | null) => void;
}
