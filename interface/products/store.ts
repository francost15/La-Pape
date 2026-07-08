import type { Categoria } from "@/interface/categorias";
import type { Product } from "@/interface/products";

export interface ProductosStore {
  negocioId: string | null;
  categories: Categoria[];
  products: Product[];

  currentProduct: Product | null;
  productLoading: boolean;
  productImageError: boolean;

  loading: boolean;
  error: string | null;

  setNegocioId: (id: string | null) => void;
  setCategories: (categories: Categoria[]) => void;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setCurrentProduct: (product: Product | null) => void;
  setProductLoading: (loading: boolean) => void;
  setProductImageError: (error: boolean) => void;

  reset: () => void;
  resetCurrentProduct: () => void;
}
