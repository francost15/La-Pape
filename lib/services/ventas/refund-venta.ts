import { VentaDetalle } from '@/interface';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { getDetallesByVenta } from '../ventas-detalle';

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
  const now = Timestamp.now();
  const detalles = await getDetallesByVenta(ventaId);
  if (!detalles.length) {
    throw new Error('La venta no tiene detalles para reembolso');
  }

  await runTransaction(db, async (transaction) => {
    const ventaRef = doc(db, 'ventas', ventaId);
    const ventaSnap = await transaction.get(ventaRef);
    if (!ventaSnap.exists()) {
      throw new Error('La venta no existe');
    }

    const estado = ventaSnap.data().estado as string | undefined;
    if (estado === 'REEMBOLSO') {
      throw new Error('La venta ya fue reembolsada');
    }

    // Validamos y aplicamos devolución de stock dentro de la misma transacción.
    for (const detalle of detalles) {
      const productRef = doc(db, 'productos', detalle.producto_id);
      const productSnap = await transaction.get(productRef);
      if (!productSnap.exists()) {
        throw new Error(`Producto no encontrado: ${detalle.producto_id}`);
      }
      const currentStock = Number(productSnap.data().cantidad ?? 0);
      transaction.update(productRef, {
        cantidad: currentStock + detalle.cantidad,
        updatedAt: now,
      });
    }

    transaction.update(ventaRef, { estado: 'REEMBOLSO', updatedAt: now });

    for (const detalle of detalles) {
      const movimientoRef = doc(collection(db, 'inventario_movimientos'));
      transaction.set(movimientoRef, {
        producto_id: detalle.producto_id,
        sucursal_id: sucursalId,
        tipo: 'ENTRADA',
        cantidad: detalle.cantidad,
        motivo: `Reembolso venta #${ventaId}`,
        usuario_id: userId,
        fecha: now,
        createdAt: now,
      });
    }
  });

  return { ventaId, detalles };
}
