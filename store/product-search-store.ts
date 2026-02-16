import { create } from 'zustand';

export type SearchContextId = 'productos' | 'ventas';

interface SearchState {
  searchText: string;
  selectedCategoryId: string | null;
}

interface ProductSearchStore {
  /** Estado de búsqueda por contexto (pestaña/ventana) */
  contexts: Record<SearchContextId, SearchState>;
  setSearchText: (contextId: SearchContextId, text: string) => void;
  setSelectedCategoryId: (contextId: SearchContextId, categoryId: string | null) => void;
  getSearchState: (contextId: SearchContextId) => SearchState;
  resetContext: (contextId: SearchContextId) => void;
}

const defaultState: SearchState = {
  searchText: '',
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
