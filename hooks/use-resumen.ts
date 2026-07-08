import { Strings } from "@/constants/strings";
import { getProductosScreenData } from "@/lib";
import { useUsuariosMap } from "@/hooks/use-usuarios-map";
import { usePeriodoFilter } from "@/hooks/use-periodo-filter";
import {
  selectCategorias,
  selectMetricas,
  selectProductosBajoStock,
  selectProductosRanking,
  selectVentasPorUsuario,
  useResumenStore,
} from "@/store/resumen-store";
import { useLayoutStore } from "@/store/layout-store";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { useEffect, useMemo } from "react";

/** Orquestación de la pantalla resumen — espejo de useHistory. */
export function useResumen() {
  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);
  const sessionError = useSessionStore((s) => s.error);
  const userId = useSessionStore((s) => s.userId);
  const userEmail = useSessionStore((s) => s.userEmail);

  const isMobile = useLayoutStore((s) => s.isMobile);

  const products = useProductosStore((s) => s.products);
  const categories = useProductosStore((s) => s.categories);
  const setProducts = useProductosStore((s) => s.setProducts);
  const setCategories = useProductosStore((s) => s.setCategories);
  const resetProductos = useProductosStore((s) => s.reset);

  const ventas = useResumenStore((s) => s.ventas);
  const detallesMap = useResumenStore((s) => s.detallesMap);
  const dataLoading = useResumenStore((s) => s.loading);
  const dataError = useResumenStore((s) => s.error);
  const subscribe = useResumenStore((s) => s.subscribe);
  const resetResumen = useResumenStore((s) => s.reset);

  const { periodo, rangoPersonalizado, setPeriodo, setRangoPersonalizado, ventasFiltradas } =
    usePeriodoFilter(ventas);

  const usuariosMap = useUsuariosMap(negocioId, ventasFiltradas);

  useEffect(() => {
    if (!sessionReady) return;
    if (!negocioId) {
      resetResumen();
      resetProductos();
      return;
    }
    return subscribe(negocioId);
  }, [sessionReady, negocioId, subscribe, resetResumen, resetProductos]);

  useEffect(() => {
    if (!sessionReady || !negocioId || !userId || products.length > 0) return;
    getProductosScreenData(userId, userEmail ?? "")
      .then(({ products: p, categories: c }) => {
        setProducts(p);
        setCategories(c);
      })
      .catch((err) => console.error("Error cargando productos:", err));
  }, [sessionReady, negocioId, userId, userEmail, products.length, setProducts, setCategories]);

  const loading = !sessionReady || (!!negocioId && dataLoading);
  const error =
    sessionReady && !negocioId ? (sessionError ?? Strings.history.noNegocioAssigned) : dataError;
  const noNegocio = sessionReady && !negocioId;

  const metricas = useMemo(
    () => selectMetricas(ventasFiltradas, detallesMap, products),
    [ventasFiltradas, detallesMap, products]
  );

  const ranking = useMemo(
    () => selectProductosRanking(ventasFiltradas, detallesMap, products),
    [ventasFiltradas, detallesMap, products]
  );

  const categorias = useMemo(
    () => selectCategorias(ventasFiltradas, detallesMap, products, categories),
    [ventasFiltradas, detallesMap, products, categories]
  );

  const ventasPorUsuario = useMemo(
    () => selectVentasPorUsuario(ventasFiltradas, usuariosMap),
    [ventasFiltradas, usuariosMap]
  );

  const productosBajoStock = useMemo(() => selectProductosBajoStock(products), [products]);

  return {
    loading,
    error,
    noNegocio,
    isMobile,
    periodo,
    setPeriodo,
    rangoPersonalizado,
    setRangoPersonalizado,
    metricas,
    ranking,
    categorias,
    ventasPorUsuario,
    productosBajoStock,
  };
}
