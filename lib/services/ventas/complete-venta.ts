import { CartItem } from '@/store/ventas-store';
import { createVenta } from './index';
import { createVentaDetalle } from '../ventas-detalle';
import { createVentaPago } from '../ventas-pagos';
import { updateProduct } from '../productos';
import { createInventarioMovimiento } from '../inventario-movimientos';

export interface CompleteVentaParams {
  items: CartItem[];
  negocioId: string;
  sucursalId: string;
  userId: string;
  total: number;
  subtotal: number;
}

export interface CompleteVentaResult {
  ventaId: string;
  fecha: Date;
  total: number;
}

/**
 * Orquesta el flujo completo de una venta:
 * 1. Crea el documento de venta
 * 2. Crea los detalles (una línea por producto)
 * 3. Registra el pago en efectivo
 * 4. Descuenta el stock de cada producto
 * 5. Registra movimientos de inventario tipo SALIDA
 */
export async function completeVentaFlow(
  params: CompleteVentaParams,
): Promise<CompleteVentaResult> {
  const { items, negocioId, sucursalId, userId, total, subtotal } = params;
  const fecha = new Date();

  const ventaId = await createVenta({
    negocio_id: negocioId,
    sucursal_id: sucursalId,
    usuario_id: userId,
    fecha,
    subtotal,
    descuento: 0,
    total,
    estado: 'PAGADA',
    tipo_venta: 'CONTADO',
  });

  const detallePromises = items.map((item) =>
    createVentaDetalle({
      venta_id: ventaId,
      producto_id: item.productId,
      cantidad: item.quantity,
      precio_unitario: item.unitPrice,
      total_linea: item.unitPrice * item.quantity,
    }),
  );
  await Promise.all(detallePromises);

  await createVentaPago({
    venta_id: ventaId,
    metodo_pago: 'EFECTIVO',
    monto: total,
  });

  const stockPromises = items.map((item) =>
    updateProduct(item.productId, {
      cantidad: item.product.cantidad - item.quantity,
    }),
  );
  await Promise.all(stockPromises);

  const movimientoPromises = items.map((item) =>
    createInventarioMovimiento({
      producto_id: item.productId,
      sucursal_id: sucursalId,
      tipo: 'SALIDA',
      cantidad: item.quantity,
      motivo: `Venta #${ventaId}`,
      usuario_id: userId,
    }),
  );
  await Promise.all(movimientoPromises);

  return { ventaId, fecha, total };
}
