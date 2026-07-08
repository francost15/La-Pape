import type { Product } from "@/interface/products";

export type VentaEstado = "PENDIENTE" | "PAGADA" | "CANCELADA" | "REEMBOLSO" | "EN_PROCESO";
export type TipoVenta = "CONTADO" | "CREDITO";

export interface Venta {
  id: string;
  negocio_id: string; // FK
  sucursal_id: string; // FK
  usuario_id: string; // FK
  cliente_id?: string; // FK (opcional)
  fecha: Date; // timestamptz
  subtotal: number; // float
  descuento: number; // float
  total: number; // float
  estado: VentaEstado; // enum
  tipo_venta: TipoVenta;
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateVentaInput {
  negocio_id: string;
  sucursal_id: string;
  usuario_id: string;
  cliente_id?: string;
  fecha?: Date;
  subtotal: number;
  descuento?: number;
  total: number;
  estado?: VentaEstado;
  tipo_venta?: TipoVenta;
  notas?: string;
}

export interface UpdateVentaInput {
  cliente_id?: string;
  subtotal?: number;
  descuento?: number;
  total?: number;
  estado?: VentaEstado;
  tipo_venta?: TipoVenta;
  notas?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface VentasStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export interface DeleteConfirmItem {
  productId: string;
  nombre: string;
}

export interface VentasUIStore {
  sheetVisible: boolean;
  deleteConfirmItem: DeleteConfirmItem | null;
  openSheet: () => void;
  closeSheet: () => void;
  setSheetVisible: (visible: boolean) => void;
  openDeleteConfirm: (item: DeleteConfirmItem) => void;
  closeDeleteConfirm: () => void;
}
