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
    // showSpinner=false revalida en segundo plano sin pasar por el estado de
    // carga: evita el flash de skeleton sobre datos ya cacheados (p. ej. cada
    // vez que se reabre el sheet de agregar productos en una venta).
    async (uid: string, email: string, showSpinner = true) => {
      try {
        if (showSpinner) setLoading(true);
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
        if (showSpinner) setLoading(false);
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

    // El catálogo ya está en memoria (store compartido entre la pantalla de
    // productos y el sheet de ventas): revalidamos en segundo plano en vez de
    // volver a mostrar el skeleton y re-descargar todo desde cero.
    loadData(userId, userEmail, products.length === 0);
    // products.length se lee de forma intencional solo para decidir el modo de
    // carga inicial; no queremos re-ejecutar en cada cambio del catálogo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
