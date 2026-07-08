import { Strings } from "@/constants/strings";
import { Venta, VentaDetalle } from "@/interface";
import { notify } from "@/lib/notify";
import { generateAndShareRecibo } from "@/lib/pdf/generate-recibo";
import type { ReciboData } from "@/lib/pdf/recibo-template";
import { onVentasByNegocio } from "@/lib/services/ventas";
import { getDetallesByVenta } from "@/lib/services/ventas-detalle";
import { refundVentaFlow } from "@/lib/services/ventas/refund-venta";
import { groupVentasByDate } from "@/lib/utils/ventas-helpers";
import { filterVentasByPeriodo, useFiltrosStore } from "@/store/filtros-store";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Capa de datos de la pantalla de historial: escucha ventas en tiempo real,
 * hidrata los detalles (con reintento para los que aún no están replicados),
 * agrupa/filtra por periodo y expone las acciones (recibo, reembolso).
 */
export function useHistory() {
  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);
  const sucursalId = useSessionStore((s) => s.sucursalId);
  const userId = useSessionStore((s) => s.userId);

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detallesMap, setDetallesMap] = useState<Record<string, VentaDetalle[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<Venta | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

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

  const ventasFiltradas = useMemo(
    () => filterVentasByPeriodo(ventas, periodo, rangoPersonalizado),
    [ventas, periodo, rangoPersonalizado]
  );

  const ventasAgrupadas = useMemo(
    () => groupVentasByDate(ventasFiltradas, detallesMap),
    [ventasFiltradas, detallesMap]
  );

  const productNames = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.nombre])),
    [products]
  );

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

  const cancelRefund = useCallback(() => setRefundTarget(null), []);

  return {
    loading,
    error,
    sections,
    ventasFiltradas,
    productNames,
    expandedIds,
    refundTarget,
    refunding,
    periodo,
    setPeriodo,
    rangoPersonalizado,
    setRangoPersonalizado,
    toggleCard,
    handleVerRecibo,
    handleReembolso,
    handleConfirmRefund,
    cancelRefund,
  };
}
