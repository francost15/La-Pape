import CategoryBreakdown from "@/components/resumen/CategoryBreakdown";
import KpiGrid from "@/components/resumen/KpiGrid";
import ProductosBajoStockList from "@/components/resumen/ProductosBajoStockList";
import TopProductsList from "@/components/resumen/TopProductsList";
import VentasPorUsuario from "@/components/resumen/VentasPorUsuario";
import PeriodFilter from "@/components/search/PeriodFilter";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import EmptyState from "@/components/ui/EmptyState";
import { useUsuariosMap } from "@/hooks/use-usuarios-map";
import { getProductosScreenData } from "@/lib";
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
import { AppFonts } from "@/constants/typography";

/**
 * Resumen Screen — Digital Atelier style.
 *
 * Flat background canvas, no card wrappers on sections.
 * KPIs render directly on canvas. Sections separated by title + spacing.
 */
export default function ResumenScreen() {
  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);
  const sessionError = useSessionStore((s) => s.error);
  const userId = useSessionStore((s) => s.userId);
  const userEmail = useSessionStore((s) => s.userEmail);

  const periodo = useFiltrosStore((s) => s.periodo);
  const rangoPersonalizado = useFiltrosStore((s) => s.rangoPersonalizado);
  const setPeriodo = useFiltrosStore((s) => s.setPeriodo);
  const setRangoPersonalizado = useFiltrosStore((s) => s.setRangoPersonalizado);
  const isMobile = useLayoutStore((s) => s.isMobile);

  const products = useProductosStore((s) => s.products);
  const categories = useProductosStore((s) => s.categories);
  const setProducts = useProductosStore((s) => s.setProducts);
  const setCategories = useProductosStore((s) => s.setCategories);
  const resetProductos = useProductosStore((s) => s.reset);

  const ventas = useResumenStore((s) => s.ventas);
  const detallesMap = useResumenStore((s) => s.detallesMap);
  const loading = useResumenStore((s) => s.loading);
  const error = useResumenStore((s) => s.error);
  const subscribe = useResumenStore((s) => s.subscribe);
  const resetResumen = useResumenStore((s) => s.reset);

  const ventasFiltradas = useMemo(
    () => filterVentasByPeriodo(ventas, periodo, rangoPersonalizado),
    [ventas, periodo, rangoPersonalizado]
  );

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

  if (sessionReady && !negocioId) {
    return (
      <AnimatedScreen>
        <View className="flex-1 items-center justify-center bg-[#FAFAF9] px-8 dark:bg-[#0C0F14]">
          <EmptyState
            icon="error"
            title={sessionError ?? "No tienes un negocio asignado"}
            description="Configura tu negocio para ver el resumen de ventas"
            iconColor="#9ca3af"
          />
        </View>
      </AnimatedScreen>
    );
  }

  if (loading) {
    return (
      <AnimatedScreen>
        <View className="flex-1 items-center justify-center gap-4 bg-[#FAFAF9] dark:bg-[#0C0F14]">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-sm text-[#9CA3AF] dark:text-[#5A6478]">Cargando resumen...</Text>
        </View>
      </AnimatedScreen>
    );
  }

  if (error) {
    return (
      <AnimatedScreen>
        <View className="flex-1 items-center justify-center bg-[#FAFAF9] px-8 dark:bg-[#0C0F14]">
          <EmptyState
            icon="error"
            title={error}
            description="Verifica tu conexión e intenta nuevamente"
            iconColor="#ef4444"
          />
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen>
      <ScrollView
        className="flex-1 bg-[#FAFAF9] dark:bg-[#0C0F14]"
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 20 : 48,
          paddingVertical: isMobile ? 16 : 40,
          paddingBottom: 140,
        }}
      >
        <View className="gap-6">
          {/* Period filter */}
          <PeriodFilter
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            rangoPersonalizado={rangoPersonalizado}
            onRangoPersonalizadoChange={setRangoPersonalizado}
          />

          {/* KPIs — directly on canvas, no card wrapper */}
          <KpiGrid metricas={metricas} isMobile={isMobile} />

          {/* ── Section: Sales by User + Categories ─────── */}
          {isMobile ? (
            <>
              <SectionTitle title="Ventas por Usuario" />
              <VentasPorUsuario data={ventasPorUsuario} />
              <SectionTitle title="Categorías" />
              <CategoryBreakdown data={categorias} isMobile={isMobile} />
            </>
          ) : (
            <View className="flex-row items-start gap-6">
              <View style={{ flex: 2 }}>
                <SectionTitle title="Ventas por Usuario" />
                <VentasPorUsuario data={ventasPorUsuario} />
              </View>
              <View style={{ flex: 3 }}>
                <SectionTitle title="Categorías" />
                <CategoryBreakdown data={categorias} isMobile={isMobile} />
              </View>
            </View>
          )}

          {/* ── Section: Top Products + Low Stock ─────── */}
          {isMobile ? (
            <>
              <SectionTitle title="Productos Más Vendidos" />
              <TopProductsList title="Productos Más Vendidos" items={ranking.top} />
              <SectionTitle title="Bajo Stock" />
              <ProductosBajoStockList items={productosBajoStock} />
            </>
          ) : (
            <View className="flex-row items-start gap-6">
              <View style={{ flex: 3 }}>
                <SectionTitle title="Productos Más Vendidos" />
                <TopProductsList title="Productos Más Vendidos" items={ranking.top} />
              </View>
              <View style={{ flex: 2 }}>
                <SectionTitle title="Bajo Stock" />
                <ProductosBajoStockList items={productosBajoStock} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

/**
 * Section title component — separates sections by typography, not borders.
 */
function SectionTitle({ title }: { title: string }) {
  return (
    <View className="mb-4 mt-4 flex-row items-center gap-3">
      <View className="h-4 w-[2px] bg-[#E5E7EB] dark:bg-[#374151]" />
      <Text
        className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9CA3AF] dark:text-[#5A6478]"
        style={{ fontFamily: AppFonts.bodyStrong }}
      >
        {title}
      </Text>
    </View>
  );
}
