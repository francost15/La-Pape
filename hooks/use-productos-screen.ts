import { auth, getProductosScreenData } from '@/lib';
import { getNegocioIdByUsuario } from '@/lib/services/usuarios-negocios';
import { useProductosStore } from '@/store/productos-store';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';

export function useProductosScreen() {
  const {
    products,
    categories,
    loading,
    error,
    setProducts,
    setCategories,
    setNegocioId,
    setLoading,
    setError,
  } = useProductosStore();

  // Función auxiliar para cargar los datos del usuario
  const loadData = async (userId: string, email: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProductosScreenData(userId, email);
      setProducts(data.products);
      setCategories(data.categories);

      const negocioId = await getNegocioIdByUsuario(userId, email);
      if (negocioId) setNegocioId(negocioId);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Verifica si el usuario está autenticado y obtiene los productos y categorías
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError('No hay usuario autenticado');
        setLoading(false);
        return;
      }

      await loadData(user.uid, user.email || '');
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('No hay usuario autenticado');
      setLoading(false);
      return;
    }
    await loadData(user.uid, user.email || '');
  };

  const retry = refresh;

  return { products, categories, loading, error, retry, refresh };
}
