import { useDebounce } from "@/hooks/useDebounce";
import type { SearchContextId } from "@/interface/product-search";
import { useProductSearchStore } from "@/store/product-search-store";
import { useProductosStore } from "@/store/productos-store";
import { useMemo } from "react";

/**
 * Hook de búsqueda por contexto. Cada pantalla (productos tab, ventas sheet)
 * mantiene su propio estado de búsqueda independiente.
 */
export const useProductSearch = (contextId: SearchContextId) => {
  const products = useProductosStore((s) => s.products);
  const categories = useProductosStore((s) => s.categories);
  const { searchText, selectedCategoryId } = useProductSearchStore(
    (s) => s.contexts[contextId] ?? { searchText: "", selectedCategoryId: null }
  );
  const setSearchText = useProductSearchStore((s) => s.setSearchText);
  const setSelectedCategoryId = useProductSearchStore((s) => s.setSelectedCategoryId);

  const debouncedSearchText = useDebounce(searchText, 300);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategoryId) {
      filtered = filtered.filter((p) => p.categoria_id === selectedCategoryId);
    }

    if (debouncedSearchText.trim()) {
      const searchLower = debouncedSearchText.toLowerCase().trim();
      const searchTerms = searchLower.split(/\s+/);
      const categoriaMap = new Map(categories.map((c) => [c.id, c.nombre.toLowerCase()]));

      filtered = filtered.filter((product) => {
        const nombreLower = product.nombre.toLowerCase();
        const marcaLower = (product.marca || "").toLowerCase();
        const categoriaNombre = categoriaMap.get(product.categoria_id) || "";
        const haystack = `${nombreLower} ${marcaLower} ${categoriaNombre}`;
        return searchTerms.every((term) => haystack.indexOf(term) !== -1);
      });
    }

    return filtered;
  }, [products, categories, debouncedSearchText, selectedCategoryId]);

  return {
    searchText,
    setSearchText: (text: string) => setSearchText(contextId, text),
    selectedCategoryId,
    setSelectedCategoryId: (id: string | null) => setSelectedCategoryId(contextId, id),
    filteredProducts,
  };
};
