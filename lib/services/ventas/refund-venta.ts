import { VentaDetalle } from '@/interface';
import { updateProduct } from '../productos';
import { createInventarioMovimiento } from '../inventario-movimientos';
import { getDetallesByVenta } from '../ventas-detalle';
import { getProductById } from '../productos';
import { updateVenta } from './index';

export interface RefundVentaParams {
  ventaId: string;
  sucursalId: string;
  userId: string;
}

export interface RefundVentaResult {
  ventaId: string;
  detalles: VentaDetalle[];
}

/**
 * Flujo completo de reembolso:
 * 1. Cambia el estado de la venta a REEMBOLSO
 * 2. Obtiene los detalles de la venta
 * 3. Devuelve el stock de cada producto
 * 4. Registra movimientos de inventario tipo ENTRADA
 */
export async function refundVentaFlow(
  params: RefundVentaParams,
): Promise<RefundVentaResult> {
  const { ventaId, sucursalId, userId } = params;

  await updateVenta(ventaId, { estado: 'REEMBOLSO' });

  const detalles = await getDetallesByVenta(ventaId);

  const stockPromises = detalles.map(async (detalle) => {
    const product = await getProductById(detalle.producto_id);
    if (!product) return;

    await updateProduct(detalle.producto_id, {
      cantidad: product.cantidad + detalle.cantidad,
    });
  });
  await Promise.all(stockPromises);

  const movPromises = detalles.map((detalle) =>
    createInventarioMovimiento({
      producto_id: detalle.producto_id,
      sucursal_id: sucursalId,
      tipo: 'ENTRADA',
      cantidad: detalle.cantidad,
      motivo: `Reembolso venta #${ventaId}`,
      usuario_id: userId,
    }),
  );
  await Promise.all(movPromises);

  return { ventaId, detalles };
}
