import { Strings } from "@/constants/strings";
import { getProductosScreenData } from "@/lib";
import { useUsuariosMap } from "@/hooks/use-usuarios-map";
import { usePeriodoFilter } from "@/hooks/use-periodo-filter";
import {
  selectCategorias,
  selectDetallesPagados,
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

  // Índices y particiones derivadas una sola vez, compartidos por los tres
  // selectores de abajo (antes cada uno reconstruía el filtro de pagadas, el
  // aplanado de detalles y hacía búsquedas lineales sobre products/categories).
  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const categoriasById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const pagadas = useMemo(
    () => ventasFiltradas.filter((v) => v.estado === "PAGADA"),
    [ventasFiltradas]
  );
  const reembolsos = useMemo(
    () => ventasFiltradas.filter((v) => v.estado === "REEMBOLSO"),
    [ventasFiltradas]
  );
  const detallesPagados = useMemo(
    () => selectDetallesPagados(pagadas, detallesMap),
    [pagadas, detallesMap]
  );

  const metricas = useMemo(
    () => selectMetricas(pagadas, reembolsos, detallesPagados, productsById),
    [pagadas, reembolsos, detallesPagados, productsById]
  );

  const ranking = useMemo(
    () => selectProductosRanking(detallesPagados, productsById),
    [detallesPagados, productsById]
  );

  const categorias = useMemo(
    () => selectCategorias(detallesPagados, productsById, categoriasById),
    [detallesPagados, productsById, categoriasById]
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
