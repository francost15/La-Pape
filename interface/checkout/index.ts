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

export interface CheckoutStore {
  confirmVisible: boolean;
  processing: boolean;
  successVenta: VentaCompletada | null;

  openConfirm: () => void;
  closeConfirm: () => void;
  setProcessing: (v: boolean) => void;
  setSuccessVenta: (venta: VentaCompletada) => void;
  closeSuccess: () => void;
}
