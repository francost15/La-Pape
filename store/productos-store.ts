import { Categoria, Product } from '@/interface';
import { create } from 'zustand';

interface ProductosStore {
  // Datos del negocio
  negocioId: string | null;
  categories: Categoria[];
  products: Product[];
  
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
  
  // Acciones combinadas
  reset: () => void;
}

const initialState = {
  negocioId: null,
  categories: [],
  products: [],
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
  
  reset: () => set(initialState),
}));
