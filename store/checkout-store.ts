import { create } from "zustand";

export interface VentaCompletada {
  id: string;
  fecha: string;
  total: number;
}

interface CheckoutStore {
  /** Modal "¿Estás seguro de completar la venta?" */
  confirmVisible: boolean;
  /** Datos de la última venta completada; si no es null, se muestra el modal de éxito */
  successVenta: VentaCompletada | null;
  openConfirm: () => void;
  closeConfirm: () => void;
  /** Cierra confirm y muestra el modal de venta exitosa con estos datos */
  setSuccessVenta: (venta: VentaCompletada) => void;
  closeSuccess: () => void;
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  confirmVisible: false,
  successVenta: null,

  openConfirm: () => set({ confirmVisible: true }),
  closeConfirm: () => set({ confirmVisible: false }),

  setSuccessVenta: (venta) =>
    set({ confirmVisible: false, successVenta: venta }),
  closeSuccess: () => set({ successVenta: null }),
}));
