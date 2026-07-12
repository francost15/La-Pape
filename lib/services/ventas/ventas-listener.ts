import type { Venta } from "@/interface/ventas";
import type { VentaDetalle } from "@/interface/ventas-detalle";
import { onVentasByNegocio, VentasQueryOptions } from "@/lib/services/ventas";
import { getDetallesByVentaIds } from "@/lib/services/ventas-detalle";

interface VentasListenerCallbacks {
  onData: (ventas: Venta[], detallesMap: Record<string, VentaDetalle[]>) => void;
  onError: (error: unknown) => void;
  onLoading?: () => void;
}

interface VentasListenerOptions {
  /** Rango/límite que acota la consulta de ventas en el servidor. */
  query?: VentasQueryOptions;
  /**
   * Cache externo de detalles por venta_id. Permite conservar los detalles ya
   * descargados cuando el listener se recrea (p. ej. al cambiar de período).
   */
  cache?: Record<string, VentaDetalle[]>;
}

/** Listener compartido de ventas + detalles con cache y reintento. */
export function createVentasDetallesListener(
  negocioId: string,
  { onData, onError, onLoading }: VentasListenerCallbacks,
  options: VentasListenerOptions = {}
): () => void {
  onLoading?.();

  const cache: Record<string, VentaDetalle[]> = options.cache ?? {};
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  // Una sola tanda de consultas 'in' por lote de ventas, en vez de una consulta por venta.
  const fetchDetalles = async (ids: string[]) => {
    const detallesPorVenta = await getDetallesByVentaIds(ids);
    const stillEmpty: string[] = [];
    for (const id of ids) {
      const dets = detallesPorVenta[id];
      if (dets && dets.length > 0) {
        cache[id] = dets;
      } else {
        stillEmpty.push(id);
      }
    }
    return stillEmpty;
  };

  const unsub = onVentasByNegocio(
    negocioId,
    async (ventasFromDb) => {
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      const idsToFetch = ventasFromDb.map((v) => v.id).filter((id) => !cache[id]?.length);

      if (idsToFetch.length > 0) {
        const stillEmpty = await fetchDetalles(idsToFetch);
        if (stillEmpty.length > 0) {
          retryTimer = setTimeout(async () => {
            await fetchDetalles(stillEmpty);
            onData(ventasFromDb, { ...cache });
          }, 2000);
        }
      }

      onData(ventasFromDb, { ...cache });
    },
    onError,
    options.query
  );

  return () => {
    unsub();
    if (retryTimer) clearTimeout(retryTimer);
  };
}
