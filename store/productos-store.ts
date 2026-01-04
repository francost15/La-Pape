import { create } from 'zustand';
import { Categoria } from '@/interface/categorias';

interface ProductosStore {
  negocioId: string | null;
  categories: Categoria[];
  setNegocioId: (id: string | null) => void;
  setCategories: (categories: Categoria[]) => void;
}

export const useProductosStore = create<ProductosStore>((set) => ({
  negocioId: null,
  categories: [],
  setNegocioId: (id) => set({ negocioId: id }),
  setCategories: (categories) => set({ categories }),
}));
