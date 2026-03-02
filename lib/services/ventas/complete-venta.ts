import { CartItem } from '@/store/ventas-store';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';

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
  if (!items.length) {
    throw new Error('No hay productos en el carrito');
  }

  const fecha = new Date();
  const now = Timestamp.now();

  const qtyByProduct = new Map<string, number>();
  for (const item of items) {
    if (item.quantity <= 0) {
      throw new Error(`Cantidad inválida para ${item.product.nombre}`);
    }
    qtyByProduct.set(
      item.productId,
      (qtyByProduct.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const ventaId = await runTransaction(db, async (transaction) => {
    // Transacción atómica para evitar ventas parciales (detalle/pago/stock desincronizados).
    const stockByProduct = new Map<string, number>();
    for (const [productId, requestedQty] of qtyByProduct.entries()) {
      const productRef = doc(db, 'productos', productId);
      const productSnap = await transaction.get(productRef);
      if (!productSnap.exists()) {
        throw new Error(`Producto no encontrado: ${productId}`);
      }

      const currentStock = Number(productSnap.data().cantidad ?? 0);
      if (currentStock < requestedQty) {
        throw new Error(
          `Stock insuficiente para "${itemName(items, productId)}" (${currentStock} disponible)`,
        );
      }

      stockByProduct.set(productId, currentStock);
    }

    const ventaRef = doc(collection(db, 'ventas'));
    transaction.set(ventaRef, {
      negocio_id: negocioId,
      sucursal_id: sucursalId,
      usuario_id: userId,
      fecha: Timestamp.fromDate(fecha),
      subtotal,
      descuento: 0,
      total,
      estado: 'PAGADA',
      tipo_venta: 'CONTADO',
      createdAt: now,
      updatedAt: now,
    });

    for (const item of items) {
      const detalleRef = doc(collection(db, 'ventas_detalle'));
      transaction.set(detalleRef, {
        venta_id: ventaRef.id,
        producto_id: item.productId,
        cantidad: item.quantity,
        precio_unitario: item.unitPrice,
        total_linea: item.unitPrice * item.quantity,
        createdAt: now,
      });
    }

    const pagoRef = doc(collection(db, 'ventas_pagos'));
    transaction.set(pagoRef, {
      venta_id: ventaRef.id,
      metodo_pago: 'EFECTIVO',
      monto: total,
      createdAt: now,
    });

    for (const [productId, requestedQty] of qtyByProduct.entries()) {
      const productRef = doc(db, 'productos', productId);
      const currentStock = stockByProduct.get(productId) ?? 0;
      transaction.update(productRef, {
        cantidad: currentStock - requestedQty,
        updatedAt: now,
      });
    }

    for (const item of items) {
      const movimientoRef = doc(collection(db, 'inventario_movimientos'));
      transaction.set(movimientoRef, {
        producto_id: item.productId,
        sucursal_id: sucursalId,
        tipo: 'SALIDA',
        cantidad: item.quantity,
        motivo: `Venta #${ventaRef.id}`,
        usuario_id: userId,
        fecha: now,
        createdAt: now,
      });
    }

    return ventaRef.id;
  });

  return { ventaId, fecha, total };
}

function itemName(items: CartItem[], productId: string): string {
  return items.find((item) => item.productId === productId)?.product.nombre ?? 'Producto';
}
