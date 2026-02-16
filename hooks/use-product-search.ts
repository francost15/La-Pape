import type { SearchContextId } from '@/store/product-search-store';
import { useProductSearchStore } from '@/store/product-search-store';
import { useProductosStore } from '@/store/productos-store';
import { useMemo } from 'react';

/**
 * Hook de búsqueda por contexto. Cada pantalla (productos tab, ventas sheet)
 * mantiene su propio estado de búsqueda independiente.
 */
export const useProductSearch = (contextId: SearchContextId) => {
  const { products, categories } = useProductosStore();
  const { searchText, selectedCategoryId } = useProductSearchStore((s) =>
    s.contexts[contextId] ?? { searchText: '', selectedCategoryId: null }
  );
  const setSearchText = useProductSearchStore((s) => s.setSearchText);
  const setSelectedCategoryId = useProductSearchStore(
    (s) => s.setSelectedCategoryId
  );

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategoryId) {
      filtered = filtered.filter((p) => p.categoria_id === selectedCategoryId);
    }

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      const searchTerms = searchLower.split(/\s+/);
      const categoriaMap = new Map(
        categories.map((c) => [c.id, c.nombre.toLowerCase()])
      );

      filtered = filtered.filter((product) => {
        const nombreLower = product.nombre.toLowerCase();
        const marcaLower = (product.marca || '').toLowerCase();
        const categoriaNombre = categoriaMap.get(product.categoria_id) || '';
        return searchTerms.every(
          (term) =>
            nombreLower.includes(term) ||
            marcaLower.includes(term) ||
            categoriaNombre.includes(term)
        );
      });
    }

    return filtered;
  }, [products, categories, searchText, selectedCategoryId]);

  return {
    searchText,
    setSearchText: (text: string) => setSearchText(contextId, text),
    selectedCategoryId,
    setSelectedCategoryId: (id: string | null) =>
      setSelectedCategoryId(contextId, id),
    filteredProducts,
  };
};
