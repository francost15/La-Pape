import type { Venta } from "@/interface/ventas";
import type { VentaDetalle } from "@/interface/ventas-detalle";
import type { VentasQueryOptions } from "@/lib/services/ventas";
import {
  createVentasDetallesListener,
  type VentasListenerCallbacks,
} from "@/lib/services/ventas/ventas-listener";
import { getRangoConsulta, useFiltrosStore } from "@/store/filtros-store";
import { AppState, type AppStateStatus } from "react-native";

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

// Mismo contrato que el listener del servicio: se reexporta con el nombre local
// para no romper a los consumidores del store.
export type VentasDataListener = VentasListenerCallbacks;

const subscribers = new Set<VentasDataListener>();

let activeNegocioId: string | null = null;
let stopInner: (() => void) | null = null;
let stopFiltros: (() => void) | null = null;
let lastSnapshot: { ventas: Venta[]; detallesMap: Record<string, VentaDetalle[]> } | null = null;

// Rango con el que se armó el listener activo. En periodos relativos ("hoy",
// "semana", "mes") el `desde` es un límite calculado que se congela: al cruzar
// medianoche/mes en una sesión always-on la consulta seguiría filtrando el día
// viejo. Guardamos el rango para detectar ese desfase y re-suscribir.
let activeRango: VentasQueryOptions | null = null;
let dayCheckTimer: ReturnType<typeof setInterval> | null = null;
let stopAppState: (() => void) | null = null;

const CHECK_INTERVAL_MS = 60_000;

function rangoKey(r: VentasQueryOptions | null): string {
  return `${r?.desde?.getTime() ?? ""}-${r?.hasta?.getTime() ?? ""}`;
}

// Si el rango relativo cambió respecto al del listener activo (p. ej. cruzó la
// medianoche), re-suscribe con el rango vigente. No-op si nada cambió.
function maybeRestartForRango(): void {
  if (!activeNegocioId || !stopInner) return;
  const { periodo, rangoPersonalizado } = useFiltrosStore.getState();
  const rango = getRangoConsulta(periodo, rangoPersonalizado);
  if (rangoKey(rango) !== rangoKey(activeRango)) startListener(activeNegocioId);
}

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
  activeRango = rango;

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
  if (dayCheckTimer) {
    clearInterval(dayCheckTimer);
    dayCheckTimer = null;
  }
  stopAppState?.();
  stopAppState = null;
  activeNegocioId = null;
  activeRango = null;
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

    // Sesión always-on (terminal de POS en foreground todo el día): un timer
    // detecta el cruce de medianoche/mes. Al volver de background lo cubre
    // AppState, porque los timers no corren fiables en segundo plano.
    dayCheckTimer ??= setInterval(maybeRestartForRango, CHECK_INTERVAL_MS);
    if (!stopAppState) {
      const onAppState = (status: AppStateStatus) => {
        if (status === "active") maybeRestartForRango();
      };
      const sub = AppState.addEventListener("change", onAppState);
      stopAppState = () => sub.remove();
    }
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
