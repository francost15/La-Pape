import { Product } from '@/interface/products';
import { auth } from '@/lib/firebase';
import { getProductosScreenData } from '@/lib/services/getProductosScreenData';
import { useProductosStore } from '@/store/productos-store';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

export function useProductosScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const { categories, setNegocioId, setCategories } = useProductosStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError('No hay usuario autenticado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getProductosScreenData(user.uid, user.email || '');
        setProducts(data.products);
        // Guardar en el store para reutilizar
        setCategories(data.categories);
        // Obtener negocioId del servicio
        const { getNegocioIdByUsuario } = await import('@/lib/services/usuarios-negocios');
        const negocioId = await getNegocioIdByUsuario(user.uid, user.email || '');
        if (negocioId) {
          setNegocioId(negocioId);
        }
      } catch (e: any) {
        setError(e?.message || 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getProductosScreenData(user.uid, user.email || '');
      setProducts(data.products);
      setCategories(data.categories);
      const { getNegocioIdByUsuario } = await import('@/lib/services/usuarios-negocios');
      const negocioId = await getNegocioIdByUsuario(user.uid, user.email || '');
      if (negocioId) setNegocioId(negocioId);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const retry = refresh;

  return { products, categories, loading, error, retry, refresh };
}
