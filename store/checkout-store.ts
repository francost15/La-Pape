import type { CheckoutStore } from "@/interface/checkout";
import { create } from "zustand";

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  confirmVisible: false,
  processing: false,
  successVenta: null,

  openConfirm: () => set({ confirmVisible: true }),
  closeConfirm: () => set({ confirmVisible: false }),
  setProcessing: (v) => set({ processing: v }),

  setSuccessVenta: (venta) =>
    set({ confirmVisible: false, processing: false, successVenta: venta }),
  closeSuccess: () => set({ successVenta: null }),
}));
