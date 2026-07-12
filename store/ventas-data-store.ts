import type { Venta } from "@/interface/ventas";
import type { VentaDetalle } from "@/interface/ventas-detalle";
import { createVentasDetallesListener } from "@/lib/services/ventas/ventas-listener";
import { getRangoConsulta, useFiltrosStore } from "@/store/filtros-store";

/**
 * Suscripción compartida de ventas + detalles.
 *
 * History y resumen viven montados a la vez (tabs), por lo que cada uno con su
 * propio listener duplicaba todas las lecturas de Firestore. Este módulo
 * mantiene UN solo listener por negocio con conteo de referencias: el primer
 * suscriptor lo crea, los siguientes reciben el último snapshot en caliente y
 * el último en irse lo desmonta. Además re-suscribe automáticamente cuando
 * cambia el período del filtro (la consulta al servidor está acotada por fecha).
 */

export interface VentasDataListener {
  onData: (ventas: Venta[], detallesMap: Record<string, VentaDetalle[]>) => void;
  onError: (error: unknown) => void;
  onLoading?: () => void;
}

const subscribers = new Set<VentasDataListener>();

let activeNegocioId: string | null = null;
let stopInner: (() => void) | null = null;
let stopFiltros: (() => void) | null = null;
let lastSnapshot: { ventas: Venta[]; detallesMap: Record<string, VentaDetalle[]> } | null = null;

// Los detalles de una venta son inmutables: conservarlos entre re-suscripciones
// (cambios de período) evita volver a descargarlos.
let detallesCache: Record<string, VentaDetalle[]> = {};

function startListener(negocioId: string): void {
  stopInner?.();

  // Al re-suscribir por cambio de período se conserva el snapshot anterior:
  // las pantallas ya recortan por período client-side, y pasar por el estado
  // de carga hacía parpadear resumen/history en cada cambio de badge.
  const esPrimeraCarga = lastSnapshot === null;

  const { periodo, rangoPersonalizado } = useFiltrosStore.getState();
  const rango = getRangoConsulta(periodo, rangoPersonalizado);

  stopInner = createVentasDetallesListener(
    negocioId,
    {
      onLoading: () => {
        if (esPrimeraCarga) subscribers.forEach((s) => s.onLoading?.());
      },
      onData: (ventas, detallesMap) => {
        lastSnapshot = { ventas, detallesMap };
        subscribers.forEach((s) => s.onData(ventas, detallesMap));
      },
      onError: (error) => subscribers.forEach((s) => s.onError(error)),
    },
    { query: rango ?? undefined, cache: detallesCache }
  );
}

function teardown(): void {
  stopInner?.();
  stopInner = null;
  stopFiltros?.();
  stopFiltros = null;
  activeNegocioId = null;
  lastSnapshot = null;
  detallesCache = {};
}

/**
 * Registra un consumidor de ventas + detalles. Devuelve la función de
 * desuscripción; cuando no quedan consumidores el listener de Firestore se
 * desmonta por completo.
 */
export function subscribeVentasData(negocioId: string, listener: VentasDataListener): () => void {
  subscribers.add(listener);

  if (activeNegocioId !== negocioId || !stopInner) {
    // Cambio de negocio: el cache y el snapshot pertenecen al negocio anterior.
    if (activeNegocioId !== negocioId) {
      detallesCache = {};
      lastSnapshot = null;
    }
    activeNegocioId = negocioId;
    startListener(negocioId);

    stopFiltros ??= useFiltrosStore.subscribe((state, prev) => {
      const cambioPeriodo =
        state.periodo !== prev.periodo || state.rangoPersonalizado !== prev.rangoPersonalizado;
      if (cambioPeriodo && activeNegocioId) startListener(activeNegocioId);
    });
  } else if (lastSnapshot) {
    // Suscriptor tardío: recibe el último snapshot sin esperar al próximo evento.
    listener.onData(lastSnapshot.ventas, lastSnapshot.detallesMap);
  } else {
    listener.onLoading?.();
  }

  return () => {
    subscribers.delete(listener);
    if (subscribers.size === 0) teardown();
  };
}
