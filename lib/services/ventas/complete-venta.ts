import { isMetodoPago } from "@/constants/pagos";
import type { CartItem, CompleteVentaParams, CompleteVentaResult } from "@/interface/ventas";
import { db } from "@/lib/firebase";
import { appendAudit } from "@/lib/services/auditoria";
import {
  InsufficientStockError,
  InvalidQuantityError,
  ProductNotFoundError,
  VentaError,
} from "@/lib/errors";
import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";

export type { CompleteVentaParams, CompleteVentaResult };

/** Id de documento reservado al abrir la confirmación. El reintento usa el mismo. */
export function reserveVentaId(): string {
  return doc(collection(db, "ventas")).id;
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
export async function completeVentaFlow(params: CompleteVentaParams): Promise<CompleteVentaResult> {
  const { ventaId, items, negocioId, sucursalId, userId, metodoPago, montoRecibido } = params;
  if (!isMetodoPago(metodoPago)) {
    throw new VentaError("El medio de pago no es válido");
  }
  if (!items.length) {
    throw new VentaError("No hay productos en el carrito");
  }

  // Solo incluir sucursal_id cuando existe: evita escribir "" (dato corrupto
  // que rompe filtros por sucursal). Firestore rechaza `undefined` en set().
  const sucursalField = sucursalId ? { sucursal_id: sucursalId } : {};

  const fecha = new Date();
  const now = Timestamp.now();

  const qtyByProduct = new Map<string, number>();
  for (const item of items) {
    if (item.quantity <= 0) {
      throw new InvalidQuantityError(item.product.nombre);
    }
    qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.quantity);
  }

  const charged = await runTransaction(db, async (transaction) => {
    const ventaRef = doc(db, "ventas", ventaId);
    const existing = await transaction.get(ventaRef);
    if (existing.exists() && existing.data().estado === "PAGADA") {
      const prev = existing.data();
      return {
        ventaId,
        total: Number(prev.total ?? 0),
        alreadyCharged: true as const,
      };
    }

    // Phase 1: Read all necessary data first (Firestore transaction rule)
    const stockByProduct = new Map<string, number>();
    const priceByProduct = new Map<string, number>();
    const snaps = await Promise.all(
      [...qtyByProduct.entries()].map(async ([productId, requestedQty]) => {
        const productSnap = await transaction.get(doc(db, "productos", productId));
        return { productId, requestedQty, productSnap };
      })
    );
    for (const { productId, requestedQty, productSnap } of snaps) {
      if (!productSnap.exists()) {
        throw new ProductNotFoundError(productId);
      }

      const data = productSnap.data();
      const currentStock = Number(data.cantidad ?? 0);
      if (currentStock < requestedQty) {
        throw new InsufficientStockError(itemName(items, productId), currentStock);
      }

      stockByProduct.set(productId, currentStock);
      priceByProduct.set(productId, Number(data.precio_venta ?? 0));
    }

    let serverTotal = 0;
    const lines = items.map((item) => {
      const unit = priceByProduct.get(item.productId) ?? 0;
      const line = Math.round(unit * item.quantity * 100) / 100;
      serverTotal = Math.round((serverTotal + line) * 100) / 100;
      return { item, unit, line };
    });
    const vuelto =
      metodoPago === "EFECTIVO" ? Math.round(((montoRecibido ?? 0) - serverTotal) * 100) / 100 : 0;
    if (metodoPago === "EFECTIVO" && (montoRecibido == null || vuelto < 0)) {
      throw new VentaError("El monto recibido no alcanza el total");
    }

    // Phase 2: Perform all write operations
    transaction.set(ventaRef, {
      negocio_id: negocioId,
      ...sucursalField,
      usuario_id: userId,
      fecha: Timestamp.fromDate(fecha),
      subtotal: serverTotal,
      descuento: 0,
      total: serverTotal,
      estado: "PAGADA",
      tipo_venta: "CONTADO",
      metodo_pago: metodoPago,
      createdAt: now,
      updatedAt: now,
    });

    for (const { item, unit, line } of lines) {
      const detalleRef = doc(collection(db, "ventas_detalle"));
      transaction.set(detalleRef, {
        venta_id: ventaRef.id,
        // Denormalizado para que las reglas de seguridad puedan validar el
        // tenant sin un get() adicional por documento
        negocio_id: negocioId,
        producto_id: item.productId,
        cantidad: item.quantity,
        precio_unitario: unit,
        total_linea: line,
        createdAt: now,
      });
    }

    const pagoRef = doc(collection(db, "ventas_pagos"));
    transaction.set(pagoRef, {
      venta_id: ventaRef.id,
      negocio_id: negocioId,
      metodo_pago: metodoPago,
      monto: serverTotal,
      ...(metodoPago === "EFECTIVO" ? { monto_recibido: montoRecibido, vuelto } : {}),
      createdAt: now,
    });

    for (const [productId, requestedQty] of qtyByProduct.entries()) {
      const productRef = doc(db, "productos", productId);
      const currentStock = stockByProduct.get(productId) ?? 0;
      transaction.update(productRef, {
        cantidad: currentStock - requestedQty,
        updatedAt: now,
      });
    }

    for (const item of items) {
      const movimientoRef = doc(collection(db, "inventario_movimientos"));
      transaction.set(movimientoRef, {
        producto_id: item.productId,
        negocio_id: negocioId,
        ...sucursalField,
        tipo: "SALIDA",
        cantidad: item.quantity,
        motivo: `Venta #${ventaRef.id}`,
        usuario_id: userId,
        fecha: now,
        createdAt: now,
      });
    }

    appendAudit(transaction, {
      negocio_id: negocioId,
      usuario_id: userId,
      accion: "venta",
      entidad: "ventas",
      entidad_id: ventaId,
      diff: { total: serverTotal, metodo_pago: metodoPago },
    });

    return { ventaId, total: serverTotal, alreadyCharged: false as const };
  });

  return {
    ventaId: charged.ventaId,
    fecha,
    total: charged.total,
    metodoPago,
    alreadyCharged: charged.alreadyCharged,
  };
}

/**
 * Utility to extract the name of a product from the cart items array
 * given its ID, primarily used for building readable error messages.
 */
function itemName(items: CartItem[], productId: string): string {
  return items.find((item) => item.productId === productId)?.product.nombre ?? "Producto";
}
