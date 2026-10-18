import { METODOS_PAGO } from "@/constants/pagos";
import type { CheckoutStore } from "@/interface/ventas";
import { reserveVentaId } from "@/lib/services/ventas/complete-venta";
import { create } from "zustand";

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  confirmVisible: false,
  processing: false,
  successVenta: null,
  metodoPago: METODOS_PAGO.EFECTIVO,
  montoRecibido: "",
  pendingVentaId: null,

  openConfirm: () =>
    set((state) => ({
      confirmVisible: true,
      montoRecibido: "",
      pendingVentaId: state.pendingVentaId ?? reserveVentaId(),
    })),
  closeConfirm: () => set({ confirmVisible: false }),
  setProcessing: (v) => set({ processing: v }),
  setMetodoPago: (metodoPago) => set({ metodoPago }),
  setMontoRecibido: (montoRecibido) => set({ montoRecibido }),

  setSuccessVenta: (venta) =>
    set({ confirmVisible: false, processing: false, successVenta: venta, pendingVentaId: null }),
  closeSuccess: () => set({ successVenta: null, pendingVentaId: null }),
}));
