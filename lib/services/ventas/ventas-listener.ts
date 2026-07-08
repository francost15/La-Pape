import type { Venta } from "@/interface/ventas";
import type { VentaDetalle } from "@/interface/ventas-detalle";
import { onVentasByNegocio } from "@/lib/services/ventas";
import { getDetallesByVenta } from "@/lib/services/ventas-detalle";

interface VentasListenerCallbacks {
  onData: (ventas: Venta[], detallesMap: Record<string, VentaDetalle[]>) => void;
  onError: (error: unknown) => void;
  onLoading?: () => void;
}

/** Listener compartido de ventas + detalles con cache y reintento. */
export function createVentasDetallesListener(
  negocioId: string,
  { onData, onError, onLoading }: VentasListenerCallbacks
): () => void {
  onLoading?.();

  const cache: Record<string, VentaDetalle[]> = {};
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const fetchDetalles = async (ids: string[]) => {
    const results = await Promise.all(
      ids.map(async (id) => ({ id, dets: await getDetallesByVenta(id) }))
    );
    const stillEmpty: string[] = [];
    for (const { id, dets } of results) {
      if (dets.length > 0) {
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
    onError
  );

  return () => {
    unsub();
    if (retryTimer) clearTimeout(retryTimer);
  };
}
