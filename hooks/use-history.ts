import { Strings } from "@/constants/strings";
import type { Venta } from "@/interface";
import { groupVentasByDate } from "@/lib/utils/ventas-helpers";
import { useHistoryStore } from "@/store/history-store";
import { usePeriodoFilter } from "@/hooks/use-periodo-filter";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { useCallback, useEffect, useMemo } from "react";

/**
 * Capa de datos de la pantalla de historial: conecta el listener del store al
 * ciclo de vida de la pantalla, agrupa/filtra por periodo y expone las acciones.
 * El estado vive en useHistoryStore (zustand); aquí solo derivamos y adaptamos.
 */
export function useHistory() {
  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);
  const sucursalId = useSessionStore((s) => s.sucursalId);
  const userId = useSessionStore((s) => s.userId);

  const ventas = useHistoryStore((s) => s.ventas);
  const detallesMap = useHistoryStore((s) => s.detallesMap);
  const dataLoading = useHistoryStore((s) => s.loading);
  const dataError = useHistoryStore((s) => s.error);
  const refundTarget = useHistoryStore((s) => s.refundTarget);
  const refunding = useHistoryStore((s) => s.refunding);
  const expandedIds = useHistoryStore((s) => s.expandedIds);
  const toggleCard = useHistoryStore((s) => s.toggleCard);
  const openRefund = useHistoryStore((s) => s.openRefund);
  const cancelRefund = useHistoryStore((s) => s.cancelRefund);
  const confirmRefund = useHistoryStore((s) => s.confirmRefund);
  const verRecibo = useHistoryStore((s) => s.verRecibo);

  const { periodo, rangoPersonalizado, setPeriodo, setRangoPersonalizado, ventasFiltradas } =
    usePeriodoFilter(ventas);

  const products = useProductosStore((s) => s.products);

  useEffect(() => {
    if (!sessionReady || !negocioId) return;
    const unsubscribe = useHistoryStore.getState().subscribe(negocioId);
    return () => {
      unsubscribe();
      useHistoryStore.getState().reset();
    };
  }, [sessionReady, negocioId]);

  const loading = !sessionReady || (!!negocioId && dataLoading);
  const error = sessionReady && !negocioId ? Strings.history.noNegocioAssigned : dataError;

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
    (venta: Venta) => verRecibo(venta, productNames),
    [verRecibo, productNames]
  );

  const handleConfirmRefund = useCallback(
    () => confirmRefund({ sucursalId, userId: userId ?? "" }),
    [confirmRefund, sucursalId, userId]
  );

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
    handleReembolso: openRefund,
    handleConfirmRefund,
    cancelRefund,
  };
}
