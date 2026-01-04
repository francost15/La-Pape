import { Categoria, Product } from '@/interface';
import { create } from 'zustand';

interface ProductosStore {
  // Datos del negocio
  negocioId: string | null;
  categories: Categoria[];
  products: Product[];
  
  // Producto actual (detalle)
  currentProduct: Product | null;
  productLoading: boolean;
  productImageError: boolean;
  
  // Estados de carga
  loading: boolean;
  error: string | null;
  
  // Búsqueda y filtrado
  searchText: string;
  selectedCategoryId: string | null;
  
  // Setters
  setNegocioId: (id: string | null) => void;
  setCategories: (categories: Categoria[]) => void;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchText: (text: string) => void;
  setSelectedCategoryId: (categoryId: string | null) => void;
  
  // Setters para producto actual
  setCurrentProduct: (product: Product | null) => void;
  setProductLoading: (loading: boolean) => void;
  setProductImageError: (error: boolean) => void;
  
  // Acciones combinadas
  reset: () => void;
  resetCurrentProduct: () => void;
}

const initialState = {
  negocioId: null,
  categories: [],
  products: [],
  currentProduct: null,
  productLoading: false,
  productImageError: false,
  loading: false,
  error: null,
  searchText: '',
  selectedCategoryId: null,
};

export const useProductosStore = create<ProductosStore>((set) => ({
  ...initialState,
  
  setNegocioId: (id) => set({ negocioId: id }),
  setCategories: (categories) => set({ categories }),
  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchText: (text) => set({ searchText: text }),
  setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
  
  // Setters para producto actual
  setCurrentProduct: (product) => set({ currentProduct: product }),
  setProductLoading: (loading) => set({ productLoading: loading }),
  setProductImageError: (error) => set({ productImageError: error }),
  
  reset: () => set(initialState),
  resetCurrentProduct: () => set({ currentProduct: null, productLoading: false, productImageError: false }),
}));
