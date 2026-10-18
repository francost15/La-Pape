import type { VentaDetalle } from "@/interface";
import type { RefundVentaParams, RefundVentaResult } from "@/interface/ventas";
import { db } from "@/lib/firebase";
import { appendAudit } from "@/lib/services/auditoria";
import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";
import { getDetallesByVenta } from "../ventas-detalle";

export type { RefundVentaParams, RefundVentaResult };

/**
 * Flujo completo de reembolso:
 * 1. Cambia el estado de la venta a REEMBOLSO
 * 2. Obtiene los detalles de la venta
 * 3. Devuelve el stock de cada producto
 * 4. Registra movimientos de inventario tipo ENTRADA
 */
export async function refundVentaFlow(params: RefundVentaParams): Promise<RefundVentaResult> {
  const { ventaId, negocioId, sucursalId, userId } = params;
  const now = Timestamp.now();
  const sucursalField = sucursalId ? { sucursal_id: sucursalId } : {};
  const detalles = await getDetallesByVenta(ventaId, negocioId);
  if (!detalles.length) {
    throw new Error("La venta no tiene detalles para reembolso");
  }

  await runTransaction(db, async (transaction) => {
    const ventaRef = doc(db, "ventas", ventaId);

    // Fase 1: TODAS las lecturas primero. Firestore exige que en una
    // transacción no haya ningún get() después del primer write; intercalar
    // get/update por producto hacía fallar todo reembolso con 2+ productos.
    const ventaSnap = await transaction.get(ventaRef);
    if (!ventaSnap.exists()) {
      throw new Error("La venta no existe");
    }

    const estado = ventaSnap.data().estado as string | undefined;
    if (estado === "REEMBOLSO") {
      throw new Error("La venta ya fue reembolsada");
    }

    // Agregamos por producto: una venta puede tener varias líneas del mismo
    // producto y el stock debe reponerse una sola vez con la suma.
    const qtyByProduct = new Map<string, number>();
    for (const detalle of detalles) {
      qtyByProduct.set(
        detalle.producto_id,
        (qtyByProduct.get(detalle.producto_id) ?? 0) + detalle.cantidad
      );
    }

    const stockByProduct = new Map<string, number>();
    const snaps = await Promise.all(
      [...qtyByProduct.keys()].map(async (productId) => {
        const productSnap = await transaction.get(doc(db, "productos", productId));
        return { productId, productSnap };
      })
    );
    for (const { productId, productSnap } of snaps) {
      if (!productSnap.exists()) {
        throw new Error(`Producto no encontrado: ${productId}`);
      }
      stockByProduct.set(productId, Number(productSnap.data().cantidad ?? 0));
    }

    // Fase 2: todas las escrituras.
    for (const [productId, qty] of qtyByProduct.entries()) {
      const productRef = doc(db, "productos", productId);
      const currentStock = stockByProduct.get(productId) ?? 0;
      transaction.update(productRef, {
        cantidad: currentStock + qty,
        updatedAt: now,
      });
    }

    transaction.update(ventaRef, { estado: "REEMBOLSO", updatedAt: now });

    for (const detalle of detalles) {
      const movimientoRef = doc(collection(db, "inventario_movimientos"));
      transaction.set(movimientoRef, {
        producto_id: detalle.producto_id,
        negocio_id: negocioId,
        ...sucursalField,
        tipo: "ENTRADA",
        cantidad: detalle.cantidad,
        motivo: `Reembolso venta #${ventaId}`,
        usuario_id: userId,
        fecha: now,
        createdAt: now,
      });
    }

    appendAudit(transaction, {
      negocio_id: negocioId,
      usuario_id: userId,
      accion: "reembolso",
      entidad: "ventas",
      entidad_id: ventaId,
    });
  });

  return { ventaId, detalles };
}
