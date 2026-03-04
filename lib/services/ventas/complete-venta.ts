import { CartItem } from '@/store/ventas-store';
import { db } from '@/lib/firebase';
import { InsufficientStockError, InvalidQuantityError, ProductNotFoundError, VentaError } from '@/lib/errors';
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
 * Orchestrates the full transactional flow of a sale.
 * 
 * Uses a Firestore atomic transaction to guarantee that either all steps succeed 
 * together or none do, preventing data inconsistencies (e.g. charging without 
 * reducing stock, or reducing stock for a failed payment).
 * 
 * Flow:
 * 1. Validates quantities and aggregates identical items
 * 2. Locks and reads current stock for all involved products
 * 3. Verifies stock availability (throws if insufficient)
 * 4. Creates the main Venta document
 * 5. Creates individual VentaDetalle lines for each product
 * 6. Records the payment in VentaPagos
 * 7. Updates the stock count in the Productos collection
 * 8. Logs the inventory movement in InventarioMovimientos
 * 
 * @param params - The necessary data including the cart items, user, and totals
 * @returns An object containing the generated ventaId, the timestamp, and the confirmed total
 * @throws VentaError if the cart is empty
 * @throws InvalidQuantityError if any item has zero or negative quantity
 * @throws ProductNotFoundError if a product no longer exists in DB
 * @throws InsufficientStockError if there isn't enough stock to fulfill the order
 */
export async function completeVentaFlow(
  params: CompleteVentaParams,
): Promise<CompleteVentaResult> {
  const { items, negocioId, sucursalId, userId, total, subtotal } = params;
  if (!items.length) {
    throw new VentaError('No hay productos en el carrito');
  }

  const fecha = new Date();
  const now = Timestamp.now();

  const qtyByProduct = new Map<string, number>();
  for (const item of items) {
    if (item.quantity <= 0) {
      throw new InvalidQuantityError(item.product.nombre);
    }
    qtyByProduct.set(
      item.productId,
      (qtyByProduct.get(item.productId) ?? 0) + item.quantity,
    );
  }

  const ventaId = await runTransaction(db, async (transaction) => {
    // Phase 1: Read all necessary data first (Firestore transaction rule)
    const stockByProduct = new Map<string, number>();
    for (const [productId, requestedQty] of qtyByProduct.entries()) {
      const productRef = doc(db, 'productos', productId);
      const productSnap = await transaction.get(productRef);
      if (!productSnap.exists()) {
        throw new ProductNotFoundError(productId);
      }

      const currentStock = Number(productSnap.data().cantidad ?? 0);
      if (currentStock < requestedQty) {
        throw new InsufficientStockError(itemName(items, productId), currentStock);
      }

      stockByProduct.set(productId, currentStock);
    }

    // Phase 2: Perform all write operations
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

/**
 * Utility to extract the name of a product from the cart items array 
 * given its ID, primarily used for building readable error messages.
 */
function itemName(items: CartItem[], productId: string): string {
  return items.find((item) => item.productId === productId)?.product.nombre ?? 'Producto';
}
