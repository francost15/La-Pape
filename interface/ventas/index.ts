export type VentaEstado = 'PENDIENTE' | 'PAGADA' | 'CANCELADA' | 'REEMBOLSO' | 'EN_PROCESO';
export type TipoVenta = 'CONTADO' | 'CREDITO';

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
