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
}

// Mantener compatibilidad temporal
export interface ProductoCategoria {
  id: string;
  nombre: string;
}