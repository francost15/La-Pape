import { labelMetodoPago } from "@/constants/pagos";
import { Strings } from "@/constants/strings";
import type { HistoryState, HistoryStore } from "@/interface/ventas";
import { notify } from "@/lib/notify";
import { generateAndShareRecibo } from "@/lib/pdf/generate-recibo";
import type { ReciboData } from "@/lib/pdf/recibo-template";
import { refundVentaFlow } from "@/lib/services/ventas/refund-venta";
import { useProductosStore } from "@/store/productos-store";
import { subscribeVentasData } from "@/store/ventas-data-store";
import { create } from "zustand";

const INITIAL_STATE: HistoryState = {
  ventas: [],
  detallesMap: {},
  loading: true,
  error: null,
  refundTarget: null,
  refunding: false,
  expandedIds: [],
};

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  ...INITIAL_STATE,

  // Escucha ventas en tiempo real e hidrata los detalles (con reintento para
  // los que aún no están replicados en Firestore). Devuelve el unsubscribe.
  // El listener de Firestore se comparte con resumen vía subscribeVentasData.
  subscribe: (negocioId: string) => {
    return subscribeVentasData(negocioId, {
      onLoading: () => set({ loading: true, error: null }),
      onData: (ventasFromDb, detallesMap) =>
        set({ ventas: ventasFromDb, detallesMap, loading: false }),
      onError: (err) => {
        console.error("Error en listener de historial:", err);
        set({ error: Strings.history.loadHistory, loading: false });
      },
    });
  },

  reset: () => set(INITIAL_STATE),

  // Solo una card expandida a la vez.
  toggleCard: (ventaId) =>
    set((s) => ({ expandedIds: s.expandedIds.includes(ventaId) ? [] : [ventaId] })),

  openRefund: (venta) => {
    if (venta.estado === "REEMBOLSO") return;
    set({ refundTarget: venta });
  },

  cancelRefund: () => set({ refundTarget: null }),

  confirmRefund: async ({ sucursalId, userId }) => {
    const { refundTarget, refunding, detallesMap } = get();
    if (!refundTarget || refunding) return;
    // Sin usuario no se puede atribuir el reembolso; evita usuario_id "" corrupto.
    if (!userId) {
      notify.error({ title: Strings.errors.session });
      return;
    }
    set({ refunding: true });
    try {
      await refundVentaFlow({ ventaId: refundTarget.id, sucursalId, userId });

      // Repone el stock localmente para reflejar el reembolso sin esperar al listener.
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
      set({ refunding: false, refundTarget: null });
    }
  },

  verRecibo: async (venta, productNames) => {
    const detalles = get().detallesMap[venta.id] ?? [];
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
      metodoPago: labelMetodoPago(venta.metodo_pago),
    };

    try {
      await generateAndShareRecibo(reciboData);
    } catch (err) {
      console.error("Error generando recibo:", err);
      notify.error({ title: Strings.history.couldNotGenerateReceipt });
    }
  },
}));
