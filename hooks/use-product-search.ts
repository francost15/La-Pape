import { useState, useMemo } from 'react';
import { Product } from '@/interface/products';
import { Categoria } from '@/interface/categorias';

export const useProductSearch = (
  products: Product[],
  categories: Categoria[]
) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtrar por categoría si hay una seleccionada
    if (selectedCategoryId) {
      filtered = filtered.filter(product => product.categoria_id === selectedCategoryId);
    }

    // Filtrar por texto de búsqueda si hay
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      const searchTerms = searchLower.split(/\s+/); // Dividir por espacios para búsqueda múltiple

      // Crear un mapa de categorías para búsqueda rápida
      const categoriaMap = new Map(categories.map(cat => [cat.id, cat.nombre.toLowerCase()]));

      filtered = filtered.filter((product) => {
        const nombreLower = product.nombre.toLowerCase();
        const marcaLower = (product.marca || '').toLowerCase();
        const categoriaNombre = categoriaMap.get(product.categoria_id) || '';
        
        // Buscar si todos los términos coinciden en alguna parte
        return searchTerms.every(term => 
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
    setSearchText,
    selectedCategoryId,
    setSelectedCategoryId,
    filteredProducts,
  };
};
