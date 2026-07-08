import type { ProductosStore } from "@/interface/products/store";
import { create } from "zustand";

const initialState = {
  negocioId: null,
  categories: [],
  products: [],
  currentProduct: null,
  productLoading: false,
  productImageError: false,
  loading: false,
  error: null,
};

export const useProductosStore = create<ProductosStore>((set) => ({
  ...initialState,

  setNegocioId: (id) => set({ negocioId: id }),
  setCategories: (categories) => set({ categories }),
  setProducts: (products) => set({ products }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setCurrentProduct: (product) => set({ currentProduct: product }),
  setProductLoading: (loading) => set({ productLoading: loading }),
  setProductImageError: (error) => set({ productImageError: error }),

  reset: () => set(initialState),
  resetCurrentProduct: () =>
    set({ currentProduct: null, productLoading: false, productImageError: false }),
}));
