import CategoryBreakdown from "@/components/resumen/CategoryBreakdown";
import KpiGrid from "@/components/resumen/KpiGrid";
import TopProductsList from "@/components/resumen/TopProductsList";
import PeriodFilter from "@/components/search/PeriodFilter";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFiltrosStore } from "@/store/filtros-store";
import { useLayoutStore } from "@/store/layout-store";
import { useProductosStore } from "@/store/productos-store";
import {
  selectCategorias,
  selectMetricas,
  selectProductosRanking,
  useResumenStore,
} from "@/store/resumen-store";
import { useSessionStore } from "@/store/session-store";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

export default function ResumenScreen() {
  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);

  const { periodo, rangoPersonalizado, setPeriodo, setRangoPersonalizado } =
    useFiltrosStore();
  const { products, categories } = useProductosStore();
  const isMobile = useLayoutStore((s) => s.isMobile);

  const ventas = useResumenStore((s) => s.ventas);
  const detallesMap = useResumenStore((s) => s.detallesMap);
  const loading = useResumenStore((s) => s.loading);
  const error = useResumenStore((s) => s.error);
  const subscribe = useResumenStore((s) => s.subscribe);

  useEffect(() => {
    if (!sessionReady || !negocioId) return;
    const unsub = subscribe(negocioId);
    return () => unsub();
  }, [sessionReady, negocioId, subscribe]);

  const ventasFiltradas = useMemo(() => {
    const ahora = new Date();
    ahora.setHours(23, 59, 59, 999);
    let inicio: Date;
    let fin: Date = ahora;

    switch (periodo) {
      case "semana":
        inicio = new Date(ahora);
        inicio.setDate(inicio.getDate() - 6);
        inicio.setHours(0, 0, 0, 0);
        break;
      case "mes":
        inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        inicio.setHours(0, 0, 0, 0);
        break;
      case "año":
        inicio = new Date(ahora.getFullYear(), 0, 1);
        inicio.setHours(0, 0, 0, 0);
        break;
      case "personalizado":
        if (rangoPersonalizado.inicio && rangoPersonalizado.fin) {
          inicio = new Date(rangoPersonalizado.inicio);
          inicio.setHours(0, 0, 0, 0);
          fin = new Date(rangoPersonalizado.fin);
          fin.setHours(23, 59, 59, 999);
        } else {
          return [];
        }
        break;
      default:
        inicio = new Date(0);
    }

    return ventas.filter((v) => {
      const f = v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
      return f >= inicio && f <= fin;
    });
  }, [ventas, periodo, rangoPersonalizado]);

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

  const formatDate = (date: Date | null): string => {
    if (!date) return "Seleccionar";
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  if (error) {
    return (
      <AnimatedScreen>
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900 px-6">
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={48}
            color="#ef4444"
            style={{ marginBottom: 12 }}
          />
          <Text className="text-base font-medium text-gray-700 dark:text-gray-300 text-center">
            {error}
          </Text>
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen>
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-neutral-900"
        contentContainerStyle={{
          padding: isMobile ? 16 : 32,
          paddingBottom: 120,
        }}
      >
        <View className={isMobile ? "" : "max-w-5xl mx-auto w-full"}>
          <PeriodFilter
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            rangoPersonalizado={rangoPersonalizado}
            onRangoPersonalizadoChange={setRangoPersonalizado}
            formatDate={formatDate}
          />

          <KpiGrid metricas={metricas} isMobile={isMobile} />

          <View className={`gap-4 mb-6 ${isMobile ? "" : "flex-row"}`}>
            <View className="flex-1">
              <CategoryBreakdown data={categorias} isMobile={isMobile} />
            </View>
          </View>

          <View className={`gap-4 ${isMobile ? "" : "flex-row"}`}>
            <TopProductsList
              title="Productos Más Vendidos"
              items={ranking.top}
              variant="top"
            />
            <TopProductsList
              title="Productos Menos Vendidos"
              items={ranking.bottom}
              variant="bottom"
            />
          </View>
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}
