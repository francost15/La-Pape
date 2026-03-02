import VentaCard from "@/components/history/VentaCard";
import PeriodFilter from "@/components/search/PeriodFilter";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import ConfirmAlert from "@/components/ui/ConfirmAlert";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Venta, VentaDetalle } from "@/interface";
import { notify } from "@/lib/notify";
import { generateAndShareRecibo } from "@/lib/pdf/generate-recibo";
import type { ReciboData } from "@/lib/pdf/recibo-template";
import { onVentasByNegocio } from "@/lib/services/ventas";
import { getDetallesByVenta } from "@/lib/services/ventas-detalle";
import { refundVentaFlow } from "@/lib/services/ventas/refund-venta";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { groupVentasByDate } from "@/lib/utils/ventas-helpers";
import { filterVentasByPeriodo, useFiltrosStore } from "@/store/filtros-store";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  SectionList,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detallesMap, setDetallesMap] = useState<
    Record<string, VentaDetalle[]>
  >({});
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
      setError("No tienes un negocio asignado");
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
        })),
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
        setError("No se pudo cargar el historial de ventas");
        setLoading(false);
      },
    );

    return () => {
      unsub();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [sessionReady, negocioId]);

  const ventasFiltradas = useMemo(
    () => filterVentasByPeriodo(ventas, periodo, rangoPersonalizado),
    [ventas, periodo, rangoPersonalizado],
  );

  const ventasAgrupadas = useMemo(
    () => groupVentasByDate(ventasFiltradas, detallesMap),
    [ventasFiltradas, detallesMap],
  );

  const products = useProductosStore((s) => s.products);
  const productNames = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.nombre])),
    [products],
  );

  const handleVerRecibo = useCallback(
    async (venta: Venta) => {
      const detalles = detallesMap[venta.id] ?? [];
      if (detalles.length === 0) {
        notify.warning({ title: "Sin detalles para esta venta" });
        return;
      }

      const fecha =
        venta.fecha instanceof Date ? venta.fecha : new Date(venta.fecha);

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
        notify.error({ title: "No se pudo generar el recibo" });
      }
    },
    [detallesMap, productNames],
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

      notify.success({ title: "Reembolso procesado correctamente" });
    } catch (err) {
      console.error("Error al procesar reembolso:", err);
      notify.error({ title: "No se pudo procesar el reembolso" });
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
    [ventasAgrupadas],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { label: string; total: number } }) => (
      <View className="flex-row items-center justify-between mb-3 px-1 pt-4 bg-gray-50 dark:bg-neutral-900">
        <Text className="text-base font-bold text-gray-800 dark:text-gray-100 capitalize">
          {section.label}
        </Text>
        <Text className="text-xl font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
          Total: {formatCurrency(section.total)}
        </Text>
      </View>
    ),
    [],
  );

  const renderVentaItem = useCallback(
    ({
      item,
    }: {
      item: { venta: Venta; detalles: VentaDetalle[]; fecha: Date };
    }) => (
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
    [expandedIds, productNames, toggleCard, handleVerRecibo, handleReembolso],
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View className={isTablet ? "max-w-5xl mx-auto w-full" : ""}>
        <PeriodFilter
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          rangoPersonalizado={rangoPersonalizado}
          onRangoPersonalizadoChange={setRangoPersonalizado}
          formatDate={formatDate}
        />
      </View>
    ),
    [isTablet, periodo, setPeriodo, rangoPersonalizado, setRangoPersonalizado],
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View className="mt-12 items-center justify-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700">
        <IconSymbol
          name="clock.fill"
          size={64}
          color="#9ca3af"
          style={{ marginBottom: 16 }}
        />
        <Text className="text-lg font-medium text-gray-600 dark:text-gray-400 text-center px-4">
          No hay ventas en este período
        </Text>
        <Text className="text-gray-500 dark:text-gray-500 text-center px-4 mt-2">
          Cambia el filtro o registra nuevas ventas
        </Text>
      </View>
    ),
    [],
  );

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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.venta.id}
        renderItem={renderVentaItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          ventasFiltradas.length === 0 ? ListEmptyComponent : undefined
        }
        className="flex-1 bg-gray-50 dark:bg-neutral-900"
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 32 : 16,
          paddingVertical: 20,
          paddingBottom: 120,
        }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      <ConfirmAlert
        visible={!!refundTarget}
        title="Confirmar reembolso"
        message={
          refundTarget
            ? `¿Reembolsar la venta por ${formatCurrency(refundTarget.total)}? Se devolverá el stock de los productos.`
            : ""
        }
        confirmText={refunding ? "Procesando..." : "Reembolsar"}
        cancelText="Cancelar"
        onConfirm={handleConfirmRefund}
        onCancel={() => setRefundTarget(null)}
        danger
      />
    </AnimatedScreen>
  );
}
