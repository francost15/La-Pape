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

// Mantener compatibilidad temporal
export interface ProductoCategoria {
  id: string;
  nombre: string;
}