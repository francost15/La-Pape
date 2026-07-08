import type { ProductSearchStore, SearchContextId, SearchState } from "@/interface/product-search";
import { create } from "zustand";

const defaultState: SearchState = {
  searchText: "",
  selectedCategoryId: null,
};

const initialContexts: Record<SearchContextId, SearchState> = {
  productos: { ...defaultState },
  ventas: { ...defaultState },
};

export const useProductSearchStore = create<ProductSearchStore>((set, get) => ({
  contexts: initialContexts,

  setSearchText: (contextId, text) =>
    set((s) => ({
      contexts: {
        ...s.contexts,
        [contextId]: { ...s.contexts[contextId], searchText: text },
      },
    })),

  setSelectedCategoryId: (contextId, categoryId) =>
    set((s) => ({
      contexts: {
        ...s.contexts,
        [contextId]: { ...s.contexts[contextId], selectedCategoryId: categoryId },
      },
    })),

  getSearchState: (contextId) => get().contexts[contextId] ?? defaultState,

  resetContext: (contextId) =>
    set((s) => ({
      contexts: {
        ...s.contexts,
        [contextId]: { ...defaultState },
      },
    })),
}));
