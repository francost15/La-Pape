import { getProductosScreenData } from "@/lib";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { useCallback, useEffect } from "react";

export function useProductosScreen() {
  const sessionReady = useSessionStore((s) => s.ready);
  const userId = useSessionStore((s) => s.userId);
  const userEmail = useSessionStore((s) => s.userEmail);
  const negocioIdFromSession = useSessionStore((s) => s.negocioId);

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

  const loadData = useCallback(
    async (uid: string, email: string) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getProductosScreenData(uid, email);
        setProducts(data.products);
        setCategories(data.categories);

        if (negocioIdFromSession) {
          setNegocioId(negocioIdFromSession);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Error al cargar los productos";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [negocioIdFromSession, setCategories, setError, setLoading, setNegocioId, setProducts]
  );

  useEffect(() => {
    if (!sessionReady) return;

    if (!userId || !userEmail) {
      setError("No hay usuario autenticado");
      setLoading(false);
      return;
    }

    loadData(userId, userEmail);
  }, [sessionReady, userId, userEmail, loadData, setError, setLoading]);

  const refresh = useCallback(async () => {
    if (!userId || !userEmail) {
      setError("No hay usuario autenticado");
      setLoading(false);
      return;
    }
    await loadData(userId, userEmail);
  }, [userId, userEmail, loadData, setError, setLoading]);

  return { products, categories, loading, error, retry: refresh, refresh };
}
