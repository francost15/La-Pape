export type SearchContextId = "productos" | "ventas";

export interface SearchState {
  searchText: string;
  selectedCategoryId: string | null;
}

export interface ProductSearchStore {
  contexts: Record<SearchContextId, SearchState>;
  setSearchText: (contextId: SearchContextId, text: string) => void;
  setSelectedCategoryId: (contextId: SearchContextId, categoryId: string | null) => void;
  getSearchState: (contextId: SearchContextId) => SearchState;
  resetContext: (contextId: SearchContextId) => void;
}
