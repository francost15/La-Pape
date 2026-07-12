import { Categoria, Product, Venta, VentaDetalle } from "@/interface";
import type {
  CategoriaVenta,
  Metricas,
  ProductoRanking,
  ResumenState,
  ResumenStore,
  VentasPorUsuario,
} from "@/interface/resumen";
import { subscribeVentasData } from "@/store/ventas-data-store";
import { create } from "zustand";

const INITIAL_STATE: ResumenState = {
  ventas: [],
  detallesMap: {},
  loading: true,
  error: null,
};

export const useResumenStore = create<ResumenStore>((set, get) => ({
  ...INITIAL_STATE,

  // Comparte el listener de Firestore con history vía subscribeVentasData.
  subscribe: (negocioId: string) => {
    return subscribeVentasData(negocioId, {
      onLoading: () => set({ loading: true, error: null }),
      onData: (ventasFromDb, detallesMap) =>
        set({ ventas: ventasFromDb, detallesMap, loading: false }),
      onError: (err) => {
        console.error("Error en listener de resumen:", err);
        set({ error: "No se pudieron cargar los datos", loading: false });
      },
    });
  },

  reset: () => set(INITIAL_STATE),
}));

/**
 * Detalles de las ventas pagadas del período, aplanados una sola vez.
 * Se comparte entre métricas, ranking y categorías (antes cada selector
 * repetía este filtro + aplanado).
 */
export function selectDetallesPagados(
  pagadas: Venta[],
  detallesMap: Record<string, VentaDetalle[]>
): VentaDetalle[] {
  const result: VentaDetalle[] = [];
  for (const v of pagadas) {
    const dets = detallesMap[v.id];
    if (dets) result.push(...dets);
  }
  return result;
}

// Los selectores reciben `productsById`/`categoriasById` como Map en vez de
// arrays: antes hacían `products.find()` por cada línea de detalle, lo que era
// O(ventas × productos) y trababa el resumen en negocios con catálogo grande.
export function selectMetricas(
  pagadas: Venta[],
  reembolsos: Venta[],
  detallesPagados: VentaDetalle[],
  productsById: Map<string, Product>
): Metricas {
  const ventasTotales = pagadas.reduce((s, v) => s + v.total, 0);
  const transacciones = pagadas.length;

  const devoluciones = reembolsos.length;
  const totalDevoluciones = reembolsos.reduce((s, v) => s + v.total, 0);

  let costoTotal = 0;
  for (const det of detallesPagados) {
    const prod = productsById.get(det.producto_id);
    if (prod?.costo_promedio) {
      costoTotal += det.cantidad * prod.costo_promedio;
    }
  }

  const gananciaNeta = ventasTotales - costoTotal;
  const porcentajeGanancia = ventasTotales > 0 ? (gananciaNeta / ventasTotales) * 100 : 0;
  const promedioTransaccion = transacciones > 0 ? ventasTotales / transacciones : 0;

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
  detallesPagados: VentaDetalle[],
  productsById: Map<string, Product>
): { top: ProductoRanking[]; bottom: ProductoRanking[] } {
  const map = new Map<string, ProductoRanking>();

  for (const det of detallesPagados) {
    const prod = productsById.get(det.producto_id);
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

  const sorted = Array.from(map.values()).sort((a, b) => b.cantidad - a.cantidad);

  return {
    top: sorted.slice(0, 5),
    bottom: sorted.slice(-5).reverse(),
  };
}

export function selectCategorias(
  detallesPagados: VentaDetalle[],
  productsById: Map<string, Product>,
  categoriasById: Map<string, Categoria>
): CategoriaVenta[] {
  const catMap = new Map<string, number>();

  for (const det of detallesPagados) {
    const prod = productsById.get(det.producto_id);
    if (!prod?.categoria_id) continue;

    const cat = categoriasById.get(prod.categoria_id);
    if (!cat) continue;

    catMap.set(cat.nombre, (catMap.get(cat.nombre) ?? 0) + det.total_linea);
  }

  return Array.from(catMap.entries())
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total);
}

export function selectProductosBajoStock(products: Product[]): Product[] {
  return products
    .filter((p) => p.cantidad <= (p.stock_minimo ?? 0))
    .sort((a, b) => a.cantidad - b.cantidad)
    .slice(0, 8);
}

export function selectVentasPorUsuario(
  ventasFiltradas: Venta[],
  usuariosMap: Record<string, { nombre: string; foto?: string }>
): VentasPorUsuario[] {
  const pagadas = ventasFiltradas.filter((v) => v.estado === "PAGADA");
  const map = new Map<string, { total: number; transacciones: number }>();

  for (const v of pagadas) {
    const uid = v.usuario_id;
    const existing = map.get(uid);
    if (existing) {
      existing.total += v.total;
      existing.transacciones += 1;
    } else {
      map.set(uid, { total: v.total, transacciones: 1 });
    }
  }

  return Array.from(map.entries())
    .map(([usuario_id, data]) => ({
      usuario_id,
      nombre: usuariosMap[usuario_id]?.nombre ?? "Vendedor",
      total: data.total,
      transacciones: data.transacciones,
      foto: usuariosMap[usuario_id]?.foto,
    }))
    .sort((a, b) => b.total - a.total);
}
