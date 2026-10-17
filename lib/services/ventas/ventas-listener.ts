import type { VentasListenerCallbacks, VentasQueryOptions, Venta } from "@/interface/ventas";
import type { VentaDetalle } from "@/interface/ventas-detalle";
import { onVentasByNegocio } from "@/lib/services/ventas";
import { getDetallesByVentaIds } from "@/lib/services/ventas-detalle";

export type { VentasListenerCallbacks };

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
  // El callback de onSnapshot es async (await de detalles antes de publicar).
  // Numeramos cada snapshot para descartar publicaciones de generaciones viejas
  // que terminen su fetch tarde y harían "retroceder" la UI a una lista vieja.
  let generation = 0;
  let latestVentas: Venta[] = [];

  // Snapshot publicado del cache. Se reutiliza la MISMA referencia mientras no
  // se agreguen detalles nuevos: así los useMemo downstream (agrupación de
  // history, métricas/ranking de resumen) no se recalculan en cada snapshot de
  // ventas cuando los detalles no cambiaron. Solo se clona al mutar el cache.
  let publishedMap: Record<string, VentaDetalle[]> | null = null;
  const publish = (ventas: Venta[], cacheChanged: boolean) => {
    if (cacheChanged || publishedMap === null) {
      publishedMap = { ...cache };
    }
    onData(ventas, publishedMap);
  };

  // Una sola tanda de consultas 'in' por lote de ventas, en vez de una consulta por venta.
  // Devuelve los ids que siguen sin detalles y si el cache cambió.
  const fetchDetalles = async (ids: string[]) => {
    const detallesPorVenta = await getDetallesByVentaIds(ids);
    const stillEmpty: string[] = [];
    let changed = false;
    for (const id of ids) {
      const dets = detallesPorVenta[id];
      if (dets && dets.length > 0) {
        cache[id] = dets;
        changed = true;
      } else {
        stillEmpty.push(id);
      }
    }
    return { stillEmpty, changed };
  };

  const unsub = onVentasByNegocio(
    negocioId,
    async (ventasFromDb) => {
      const myGen = ++generation;
      latestVentas = ventasFromDb;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      const idsToFetch = ventasFromDb.map((v) => v.id).filter((id) => !cache[id]?.length);

      if (idsToFetch.length > 0) {
        const { stillEmpty, changed } = await fetchDetalles(idsToFetch);
        // Un snapshot más nuevo llegó mientras esperábamos: descartar esta emisión.
        if (myGen !== generation) return;
        if (stillEmpty.length > 0) {
          retryTimer = setTimeout(async () => {
            const retry = await fetchDetalles(stillEmpty);
            // El retry solo rellena el cache de detalles; re-emite la lista de
            // ventas MÁS RECIENTE (no una congelada) y solo si sigue vigente.
            if (myGen !== generation) return;
            publish(latestVentas, retry.changed);
          }, 2000);
        }
        publish(ventasFromDb, changed);
      } else {
        publish(ventasFromDb, false);
      }
    },
    onError,
    options.query
  );

  return () => {
    generation += 1;
    unsub();
    if (retryTimer) clearTimeout(retryTimer);
  };
}
