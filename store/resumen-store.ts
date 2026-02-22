import { Categoria, Product, Venta, VentaDetalle } from "@/interface";
import { onVentasByNegocio } from "@/lib/services/ventas";
import { getDetallesByVenta } from "@/lib/services/ventas-detalle";
import { create } from "zustand";

// ─── Tipos ───────────────────────────────────────────────────────────

export interface Metricas {
  ventasTotales: number;
  gananciaNeta: number;
  transacciones: number;
  devoluciones: number;
  totalDevoluciones: number;
  porcentajeGanancia: number;
  promedioTransaccion: number;
}

export interface ProductoRanking {
  producto: Product;
  cantidad: number;
  total: number;
}

export interface CategoriaVenta {
  nombre: string;
  total: number;
}

interface ResumenState {
  ventas: Venta[];
  detallesMap: Record<string, VentaDetalle[]>;
  loading: boolean;
  error: string | null;
}

interface ResumenActions {
  subscribe: (negocioId: string) => () => void;
  reset: () => void;
}

type ResumenStore = ResumenState & ResumenActions;

const INITIAL_STATE: ResumenState = {
  ventas: [],
  detallesMap: {},
  loading: true,
  error: null,
};

// ─── Store ───────────────────────────────────────────────────────────

export const useResumenStore = create<ResumenStore>((set, get) => ({
  ...INITIAL_STATE,

  subscribe: (negocioId: string) => {
    set({ loading: true, error: null });
    const cache: Record<string, VentaDetalle[]> = {};
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const fetchDetalles = async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(async (id) => ({
          id,
          dets: await getDetallesByVenta(id),
        })),
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

        const idsToFetch = ventasFromDb
          .map((v) => v.id)
          .filter((id) => !cache[id]?.length);

        if (idsToFetch.length > 0) {
          const stillEmpty = await fetchDetalles(idsToFetch);

          if (stillEmpty.length > 0) {
            retryTimer = setTimeout(async () => {
              await fetchDetalles(stillEmpty);
              set({ detallesMap: { ...cache } });
            }, 2000);
          }
        }

        set({
          ventas: ventasFromDb,
          detallesMap: { ...cache },
          loading: false,
        });
      },
      (err) => {
        console.error("Error en listener de resumen:", err);
        set({ error: "No se pudieron cargar los datos", loading: false });
      },
    );

    return () => {
      unsub();
      if (retryTimer) clearTimeout(retryTimer);
    };
  },

  reset: () => set(INITIAL_STATE),
}));

// ─── Selectores puros ────────────────────────────────────────────────

function getDetallesForVentas(
  ventaIds: string[],
  detallesMap: Record<string, VentaDetalle[]>,
): VentaDetalle[] {
  const result: VentaDetalle[] = [];
  for (const id of ventaIds) {
    const dets = detallesMap[id];
    if (dets) result.push(...dets);
  }
  return result;
}

export function selectMetricas(
  ventasFiltradas: Venta[],
  detallesMap: Record<string, VentaDetalle[]>,
  products: Product[],
): Metricas {
  const pagadas = ventasFiltradas.filter((v) => v.estado === "PAGADA");
  const ventasTotales = pagadas.reduce((s, v) => s + v.total, 0);
  const transacciones = pagadas.length;

  const reembolsos = ventasFiltradas.filter((v) => v.estado === "REEMBOLSO");
  const devoluciones = reembolsos.length;
  const totalDevoluciones = reembolsos.reduce((s, v) => s + v.total, 0);

  const pagadasIds = pagadas.map((v) => v.id);
  const detallesFiltrados = getDetallesForVentas(pagadasIds, detallesMap);

  let costoTotal = 0;
  for (const det of detallesFiltrados) {
    const prod = products.find((p) => p.id === det.producto_id);
    if (prod?.costo_promedio) {
      costoTotal += det.cantidad * prod.costo_promedio;
    }
  }

  const gananciaNeta = ventasTotales - costoTotal;
  const porcentajeGanancia =
    ventasTotales > 0 ? (gananciaNeta / ventasTotales) * 100 : 0;
  const promedioTransaccion =
    transacciones > 0 ? ventasTotales / transacciones : 0;

  return {
    ventasTotales,
    gananciaNeta,
    transacciones,
    devoluciones,
    totalDevoluciones,
    porcentajeGanancia,
    promedioTransaccion,
  };
}

export function selectProductosRanking(
  ventasFiltradas: Venta[],
  detallesMap: Record<string, VentaDetalle[]>,
  products: Product[],
): { top: ProductoRanking[]; bottom: ProductoRanking[] } {
  const pagadasIds = ventasFiltradas
    .filter((v) => v.estado === "PAGADA")
    .map((v) => v.id);
  const detallesFiltrados = getDetallesForVentas(pagadasIds, detallesMap);

  const map = new Map<string, ProductoRanking>();

  for (const det of detallesFiltrados) {
    const prod = products.find((p) => p.id === det.producto_id);
    if (!prod) continue;

    const existing = map.get(prod.id);
    if (existing) {
      existing.cantidad += det.cantidad;
      existing.total += det.total_linea;
    } else {
      map.set(prod.id, {
        producto: prod,
        cantidad: det.cantidad,
        total: det.total_linea,
      });
    }
  }

  const sorted = Array.from(map.values()).sort(
    (a, b) => b.cantidad - a.cantidad,
  );

  return {
    top: sorted.slice(0, 5),
    bottom: sorted.slice(-5).reverse(),
  };
}

export function selectCategorias(
  ventasFiltradas: Venta[],
  detallesMap: Record<string, VentaDetalle[]>,
  products: Product[],
  categories: Categoria[],
): CategoriaVenta[] {
  const pagadasIds = ventasFiltradas
    .filter((v) => v.estado === "PAGADA")
    .map((v) => v.id);
  const detallesFiltrados = getDetallesForVentas(pagadasIds, detallesMap);

  const catMap = new Map<string, number>();

  for (const det of detallesFiltrados) {
    const prod = products.find((p) => p.id === det.producto_id);
    if (!prod?.categoria_id) continue;

    const cat = categories.find((c) => c.id === prod.categoria_id);
    if (!cat) continue;

    catMap.set(cat.nombre, (catMap.get(cat.nombre) ?? 0) + det.total_linea);
  }

  return Array.from(catMap.entries())
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total);
}
