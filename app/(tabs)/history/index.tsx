import VentaCard from "@/components/history/VentaCard";
import PeriodFilter from "@/components/search/PeriodFilter";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import ConfirmAlert from "@/components/ui/ConfirmAlert";
import EmptyState from "@/components/ui/EmptyState";
import { Venta, VentaDetalle } from "@/interface";
import { Strings } from "@/constants/strings";
import { notify } from "@/lib/notify";
import { generateAndShareRecibo } from "@/lib/pdf/generate-recibo";
import type { ReciboData } from "@/lib/pdf/recibo-template";
import { onVentasByNegocio } from "@/lib/services/ventas";
import { getDetallesByVenta } from "@/lib/services/ventas-detalle";
import { refundVentaFlow } from "@/lib/services/ventas/refund-venta";
import { formatCurrency } from "@/lib/utils/format";
import { groupVentasByDate } from "@/lib/utils/ventas-helpers";
import { filterVentasByPeriodo, useFiltrosStore } from "@/store/filtros-store";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SectionList,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detallesMap, setDetallesMap] = useState<Record<string, VentaDetalle[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<Venta | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const sucursalId = useSessionStore((s) => s.sucursalId);
  const userId = useSessionStore((s) => s.userId);
  const periodo = useFiltrosStore((s) => s.periodo);
  const rangoPersonalizado = useFiltrosStore((s) => s.rangoPersonalizado);
  const setPeriodo = useFiltrosStore((s) => s.setPeriodo);
  const setRangoPersonalizado = useFiltrosStore((s) => s.setRangoPersonalizado);

  const detallesCacheRef = useRef<Record<string, VentaDetalle[]>>({});

  useEffect(() => {
    if (!sessionReady) return;

    if (!negocioId) {
      setLoading(false);
      setError(Strings.history.noNegocioAssigned);
      return;
    }

    setLoading(true);
    setError(null);

    const retryTimerRef = {
      current: null as ReturnType<typeof setTimeout> | null,
    };

    const fetchDetalles = async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(async (id) => ({
          id,
          dets: await getDetallesByVenta(id),
        }))
      );
      const updated = { ...detallesCacheRef.current };
      const stillEmpty: string[] = [];

      for (const { id, dets } of results) {
        if (dets.length > 0) {
          updated[id] = dets;
        } else {
          stillEmpty.push(id);
        }
      }

      detallesCacheRef.current = updated;
      setDetallesMap(updated);
      return stillEmpty;
    };

    const unsub = onVentasByNegocio(
      negocioId,
      async (ventasFromDb) => {
        setVentas(ventasFromDb);

        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }

        const idsToFetch = ventasFromDb
          .map((v) => v.id)
          .filter((id) => !detallesCacheRef.current[id]?.length);

        if (idsToFetch.length > 0) {
          const stillEmpty = await fetchDetalles(idsToFetch);

          if (stillEmpty.length > 0) {
            retryTimerRef.current = setTimeout(async () => {
              await fetchDetalles(stillEmpty);
            }, 2000);
          }
        } else {
          setDetallesMap(detallesCacheRef.current);
        }

        setLoading(false);
      },
      (err) => {
        console.error("Error en listener de historial:", err);
        setError(Strings.history.loadHistory);
        setLoading(false);
      }
    );

    return () => {
      unsub();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [sessionReady, negocioId]);

  const products = useProductosStore((s) => s.products);

  const ventasFiltradas = useMemo(() => {
    return filterVentasByPeriodo(ventas, periodo, rangoPersonalizado);
  }, [ventas, periodo, rangoPersonalizado]);

  const ventasAgrupadas = useMemo(
    () => groupVentasByDate(ventasFiltradas, detallesMap),
    [ventasFiltradas, detallesMap]
  );

  const productNames = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.nombre])),
    [products]
  );

  const handleVerRecibo = useCallback(
    async (venta: Venta) => {
      const detalles = detallesMap[venta.id] ?? [];
      if (detalles.length === 0) {
        notify.warning({ title: Strings.history.noSaleDetails });
        return;
      }

      const fecha = venta.fecha instanceof Date ? venta.fecha : new Date(venta.fecha);

      const reciboData: ReciboData = {
        ventaId: venta.id,
        fecha,
        items: detalles.map((d) => ({
          nombre: productNames[d.producto_id] ?? "Producto",
          cantidad: d.cantidad,
          precioUnitario: d.precio_unitario,
          totalLinea: d.total_linea,
        })),
        subtotal: venta.subtotal,
        descuento: venta.descuento,
        total: venta.total,
        metodoPago: "Efectivo",
      };

      try {
        await generateAndShareRecibo(reciboData);
      } catch (err) {
        console.error("Error generando recibo:", err);
        notify.error({ title: Strings.history.couldNotGenerateReceipt });
      }
    },
    [detallesMap, productNames]
  );

  const toggleCard = useCallback((ventaId: string) => {
    setExpandedIds((prev) => (prev.includes(ventaId) ? [] : [ventaId]));
  }, []);

  const handleReembolso = useCallback((venta: Venta) => {
    if (venta.estado === "REEMBOLSO") return;
    setRefundTarget(venta);
  }, []);

  const handleConfirmRefund = useCallback(async () => {
    if (!refundTarget || refunding) return;
    setRefunding(true);
    try {
      await refundVentaFlow({
        ventaId: refundTarget.id,
        sucursalId: sucursalId ?? "",
        userId: userId ?? "",
      });

      const detalles = detallesMap[refundTarget.id] ?? [];
      const currentProducts = useProductosStore.getState().products;
      const updated = currentProducts.map((p) => {
        const det = detalles.find((d) => d.producto_id === p.id);
        return det ? { ...p, cantidad: p.cantidad + det.cantidad } : p;
      });
      useProductosStore.getState().setProducts(updated);

      notify.success({ title: Strings.history.refundSuccess });
    } catch (err) {
      console.error("Error al procesar reembolso:", err);
      notify.error({ title: Strings.history.refundError });
    } finally {
      setRefunding(false);
      setRefundTarget(null);
    }
  }, [refundTarget, refunding, sucursalId, userId, detallesMap]);

  const sections = useMemo(
    () =>
      ventasAgrupadas.map((group) => ({
        key: group.key,
        label: group.label,
        total: group.total,
        data: group.ventas,
      })),
    [ventasAgrupadas]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { label: string; total: number } }) => {
      const isTodayOrYesterday = section.label === "Hoy" || section.label === "Ayer";
      return (
        <Animated.View
          entering={FadeIn.duration(320)}
          className="mt-2 mb-4 flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5 dark:border-neutral-700 dark:bg-neutral-800"
          style={
            Platform.OS === "web" ? { boxShadow: "0 2px 6px rgba(0,0,0,0.06)" } : { elevation: 2 }
          }
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-8 w-1 rounded-full"
              style={{
                backgroundColor: isTodayOrYesterday ? "#ea580c" : "#e5e7eb",
              }}
            />
            <Text
              className={`text-base font-bold capitalize ${
                isTodayOrYesterday
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-800 dark:text-gray-100"
              }`}
            >
              {section.label}
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-700 tabular-nums dark:text-gray-300">
            {formatCurrency(section.total)}
          </Text>
        </Animated.View>
      );
    },
    []
  );

  const renderVentaItem = useCallback(
    ({ item }: { item: { venta: Venta; detalles: VentaDetalle[]; fecha: Date } }) => (
      <View style={{ marginBottom: 12 }}>
        <VentaCard
          venta={item.venta}
          detalles={item.detalles}
          fecha={item.fecha}
          isReembolso={item.venta.estado === "REEMBOLSO"}
          expandido={expandedIds.includes(item.venta.id)}
          productNames={productNames}
          onToggle={() => toggleCard(item.venta.id)}
          onVerRecibo={handleVerRecibo}
          onReembolso={handleReembolso}
        />
      </View>
    ),
    [expandedIds, productNames, toggleCard, handleVerRecibo, handleReembolso]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View className={isTablet ? "mx-auto w-full max-w-2xl pb-2" : "pb-2"}>
        <PeriodFilter
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          rangoPersonalizado={rangoPersonalizado}
          onRangoPersonalizadoChange={setRangoPersonalizado}
        />
      </View>
    ),
    [isTablet, periodo, setPeriodo, rangoPersonalizado, setRangoPersonalizado]
  );

  const ListEmptyComponent = useMemo(
    () => (
      <Animated.View entering={FadeIn.duration(400)} className="mt-20 px-10">
        <EmptyState
          icon="clock"
          title={Strings.history.emptySales}
          description={Strings.history.emptySalesHint}
        />
      </Animated.View>
    ),
    []
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-gray-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {Strings.history.loadingHistory}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <AnimatedScreen>
        <View className="flex-1 items-center justify-center bg-gray-50 px-8 dark:bg-neutral-900">
          <EmptyState
            icon="error"
            title={error}
            description={Strings.errors.connection}
            iconColor="#ef4444"
          />
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.venta.id}
        renderItem={renderVentaItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ventasFiltradas.length === 0 ? ListEmptyComponent : undefined}
        className="flex-1 bg-gray-50 dark:bg-neutral-900"
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 24 : 16,
          paddingTop: 12,
          paddingBottom: 120,
        }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      <ConfirmAlert
        visible={!!refundTarget}
        title={Strings.history.refundConfirm}
        message={
          refundTarget
            ? `¿Reembolsar la venta por ${formatCurrency(refundTarget.total)}? Se devolverá el stock de los productos.`
            : ""
        }
        confirmText={refunding ? Strings.history.processingRefund : Strings.history.refund}
        cancelText={Strings.common.cancel}
        onConfirm={handleConfirmRefund}
        onCancel={() => setRefundTarget(null)}
        danger
      />
    </AnimatedScreen>
  );
}
