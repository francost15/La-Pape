export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'CHEQUE' | 'OTRO';

export interface VentaPago {
  id: string;
  venta_id: string; // FK
  metodo_pago: MetodoPago; // String en lugar de FK
  monto: number; // float
  referencia?: string; // varchar - Para transferencias, cheques, etc.
  createdAt?: Date;
}

export interface CreateVentaPagoInput {
  venta_id: string;
  metodo_pago: MetodoPago;
  monto: number;
  referencia?: string;
}

export interface UpdateVentaPagoInput {
  metodo_pago?: MetodoPago;
  monto?: number;
  referencia?: string;
}
