export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface InventarioMovimiento {
  id: string;
  producto_id: string; // FK
  sucursal_id: string; // FK
  tipo: TipoMovimiento;
  cantidad: number; // int
  motivo: string; // varchar(100)
  usuario_id: string; // FK
  createdAt?: Date;
}

export interface CreateInventarioMovimientoInput {
  producto_id: string;
  sucursal_id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string;
  usuario_id: string;
}

export interface UpdateInventarioMovimientoInput {
  tipo?: TipoMovimiento;
  cantidad?: number;
  motivo?: string;
}
