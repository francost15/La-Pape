import { METODOS_PAGO } from "@/constants/pagos";
import type { CheckoutStore } from "@/interface/ventas";
import { create } from "zustand";

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  confirmVisible: false,
  processing: false,
  successVenta: null,
  metodoPago: METODOS_PAGO.EFECTIVO,
  montoRecibido: "",

  openConfirm: () => set({ confirmVisible: true, montoRecibido: "" }),
  closeConfirm: () => set({ confirmVisible: false }),
  setProcessing: (v) => set({ processing: v }),
  setMetodoPago: (metodoPago) => set({ metodoPago }),
  setMontoRecibido: (montoRecibido) => set({ montoRecibido }),

  setSuccessVenta: (venta) =>
    set({ confirmVisible: false, processing: false, successVenta: venta }),
  closeSuccess: () => set({ successVenta: null }),
}));
