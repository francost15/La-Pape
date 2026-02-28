import CategoryBreakdown from "@/components/resumen/CategoryBreakdown";
import KpiGrid from "@/components/resumen/KpiGrid";
import ProductosBajoStockList from "@/components/resumen/ProductosBajoStockList";
import TopProductsList from "@/components/resumen/TopProductsList";
import VentasPorUsuario from "@/components/resumen/VentasPorUsuario";
import PeriodFilter from "@/components/search/PeriodFilter";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useUsuariosMap } from "@/hooks/use-usuarios-map";
import { getProductosScreenData } from "@/lib";
import { formatDate } from "@/lib/utils/format";
import { filterVentasByPeriodo, useFiltrosStore } from "@/store/filtros-store";
import { useLayoutStore } from "@/store/layout-store";
import { useProductosStore } from "@/store/productos-store";
import {
  selectCategorias,
  selectMetricas,
  selectProductosBajoStock,
  selectProductosRanking,
  selectVentasPorUsuario,
  useResumenStore,
} from "@/store/resumen-store";
import { useSessionStore } from "@/store/session-store";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

// ─── Pantalla principal ───────────────────────────────────────────────────────

/**
 * Orquestador de la pantalla de resumen.
 *
 * Responsabilidades de este componente:
 * - Leer el estado de sesión, filtros y datos desde los stores de Zustand
 * - Suscribirse al listener en tiempo real cuando la sesión esté lista
 * - Computar los datos derivados (metricas, ranking, categorias…) con useMemo
 * - Delegar todo el render a sub-componentes especializados
 *
 * NO contiene lógica de UI de los sub-componentes ni formateo ad-hoc.
 */
export default function ResumenScreen() {
  // ── Sesión ─────────────────────────────────────────────────────────────────
  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);
  const sessionError = useSessionStore((s) => s.error);
  const userId = useSessionStore((s) => s.userId);
  const userEmail = useSessionStore((s) => s.userEmail);

  // ── Filtros y layout ───────────────────────────────────────────────────────
  const { periodo, rangoPersonalizado, setPeriodo, setRangoPersonalizado } =
    useFiltrosStore();
  const isMobile = useLayoutStore((s) => s.isMobile);

  // ── Productos ──────────────────────────────────────────────────────────────
  const {
    products,
    categories,
    setProducts,
    setCategories,
    reset: resetProductos,
  } = useProductosStore();

  // ── Ventas en tiempo real ──────────────────────────────────────────────────
  const ventas = useResumenStore((s) => s.ventas);
  const detallesMap = useResumenStore((s) => s.detallesMap);
  const loading = useResumenStore((s) => s.loading);
  const error = useResumenStore((s) => s.error);
  const subscribe = useResumenStore((s) => s.subscribe);
  const resetResumen = useResumenStore((s) => s.reset);

  // Filtramos las ventas según el período seleccionado antes de pasarlas a los selectores
  const ventasFiltradas = useMemo(
    () => filterVentasByPeriodo(ventas, periodo, rangoPersonalizado),
    [ventas, periodo, rangoPersonalizado],
  );

  // ── Usuarios ───────────────────────────────────────────────────────────────
  // Hook externo que resuelve nombres y fotos de vendedores de forma asíncrona
  const usuariosMap = useUsuariosMap(negocioId, ventasFiltradas);

  // ── Efectos de carga ───────────────────────────────────────────────────────

  // Suscribirse al listener real-time de ventas cuando la sesión esté lista
  useEffect(() => {
    if (!sessionReady) return;
    if (!negocioId) {
      resetResumen();
      resetProductos();
      return;
    }
    return subscribe(negocioId);
  }, [sessionReady, negocioId, subscribe, resetResumen, resetProductos]);

  // Cargar catálogo de productos (se necesita para métricas y ranking)
  useEffect(() => {
    if (!sessionReady || !negocioId || !userId || products.length > 0) return;
    getProductosScreenData(userId, userEmail ?? "")
      .then(({ products: p, categories: c }) => {
        setProducts(p);
        setCategories(c);
      })
      .catch(() => {});
  }, [sessionReady, negocioId, userId, userEmail, products.length, setProducts, setCategories]);

  // ── Datos derivados (memoizados para evitar recálculo innecesario) ──────────
  const metricas = useMemo(
    () => selectMetricas(ventasFiltradas, detallesMap, products),
    [ventasFiltradas, detallesMap, products],
  );

  const ranking = useMemo(
    () => selectProductosRanking(ventasFiltradas, detallesMap, products),
    [ventasFiltradas, detallesMap, products],
  );

  const categorias = useMemo(
    () => selectCategorias(ventasFiltradas, detallesMap, products, categories),
    [ventasFiltradas, detallesMap, products, categories],
  );

  const ventasPorUsuario = useMemo(
    () => selectVentasPorUsuario(ventasFiltradas, usuariosMap),
    [ventasFiltradas, usuariosMap],
  );

  const productosBajoStock = useMemo(
    () => selectProductosBajoStock(products),
    [products],
  );

  // ── Estados especiales ─────────────────────────────────────────────────────

  if (sessionReady && !negocioId) {
    return (
      <AnimatedScreen>
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900 px-6 gap-3">
          <IconSymbol name="building.2.fill" size={48} color="#9ca3af" />
          <Text className="text-base font-medium text-gray-700 dark:text-gray-300 text-center">
            {sessionError ?? "No tienes un negocio asignado"}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Configura tu negocio para ver el resumen de ventas
          </Text>
        </View>
      </AnimatedScreen>
    );
  }

  if (loading) {
    return (
      <AnimatedScreen>
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      </AnimatedScreen>
    );
  }

  if (error) {
    return (
      <AnimatedScreen>
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900 px-6 gap-3">
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#ef4444" />
          <Text className="text-base font-medium text-gray-700 dark:text-gray-300 text-center">
            {error}
          </Text>
        </View>
      </AnimatedScreen>
    );
  }

  // ── Render principal ────────────────────────────────────────────────────────
  return (
    <AnimatedScreen>
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-neutral-900"
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 14 : 32,
          paddingVertical: isMobile ? 14 : 20,
          paddingBottom: 120,
        }}
      >
        {/*
         * Contenedor principal: sin max-width para aprovechar todo el ancho
         * disponible en pantallas grandes.
         */}
        <View className="gap-4">
          {/* Selector de período */}
          <PeriodFilter
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            rangoPersonalizado={rangoPersonalizado}
            onRangoPersonalizadoChange={setRangoPersonalizado}
            formatDate={(d) => formatDate(d)}
          />

          {/* KPIs principales — siempre en fila horizontal */}
          <KpiGrid metricas={metricas} isMobile={isMobile} />

          {/*
           * Fila 1 (desktop): Ventas por Usuario [40%] | Categorías [60%]
           * La ratio asimétrica da más espacio al donut + leyenda, que necesita más lugar.
           * En mobile: apiladas verticalmente.
           */}
          {isMobile ? (
            <>
              <VentasPorUsuario data={ventasPorUsuario} />
              <CategoryBreakdown data={categorias} isMobile={isMobile} />
            </>
          ) : (
            <View className="flex-row gap-4 items-start">
              {/* 40% — lista de vendedores */}
              <View style={{ flex: 2 }}>
                <VentasPorUsuario data={ventasPorUsuario} />
              </View>
              {/* 60% — gráfico de categorías */}
              <View style={{ flex: 3 }}>
                <CategoryBreakdown data={categorias} isMobile={isMobile} />
              </View>
            </View>
          )}

          {/*
           * Fila 2 (desktop): Top Vendidos [60%] | Bajo Stock [40%]
           * Los productos top tienen más items, necesitan más ancho.
           * En mobile: apiladas verticalmente.
           */}
          {isMobile ? (
            <>
              <TopProductsList title="Productos Más Vendidos" items={ranking.top} />
              <ProductosBajoStockList items={productosBajoStock} />
            </>
          ) : (
            <View className="flex-row gap-4 items-start">
              <View style={{ flex: 3 }}>
                <TopProductsList title="Productos Más Vendidos" items={ranking.top} />
              </View>
              <View style={{ flex: 2 }}>
                <ProductosBajoStockList items={productosBajoStock} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}
