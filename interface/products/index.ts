export interface Product {
    id: string;
    nombre: string;
    precio: number;
    marca: string;
    precio_mayoreo: number;
    imagen?: string;
    descripcion?: string;
    categoria?: ProductoCategoria;
    stock?: boolean;
  }

  
export interface CardProductsProps {
    product: Product;
    onPress?: () => void;
    className?: string;
  }

export interface ProductoCategoria {
    id: string;
    nombre: string;
}