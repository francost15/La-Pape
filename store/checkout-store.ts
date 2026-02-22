import { create } from "zustand";

export interface VentaCompletadaItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}

export interface VentaCompletada {
  id: string;
  fecha: string;
  total: number;
  subtotal: number;
  descuento: number;
  items: VentaCompletadaItem[];
}

interface CheckoutStore {
  confirmVisible: boolean;
  processing: boolean;
  successVenta: VentaCompletada | null;

  openConfirm: () => void;
  closeConfirm: () => void;
  setProcessing: (v: boolean) => void;
  setSuccessVenta: (venta: VentaCompletada) => void;
  closeSuccess: () => void;
}

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
