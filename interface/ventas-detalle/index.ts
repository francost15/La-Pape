export interface VentaDetalle {
  id: string;
  venta_id: string; // FK
  producto_id: string; // FK
  cantidad: number; // float
  precio_unitario: number; // float
  total_linea: number; // float
  createdAt?: Date;
}

export interface CreateVentaDetalleInput {
  venta_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  total_linea: number;
}

export interface UpdateVentaDetalleInput {
  cantidad?: number;
  precio_unitario?: number;
  total_linea?: number;
}
