import { VentaDetalle } from "@/interface";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

// Firestore limita los operadores 'in' a 10 valores por consulta.
const IN_QUERY_MAX = 10;

/**
 * Detalles de varias ventas.
 * Índice compuesto: ventas_detalle (negocio_id ASC, venta_id ASC).
 * El filtro de negocio deja que la query cumpla las reglas y no mezcle tenants.
 */
export const getDetallesByVentaIds = async (
  negocioId: string,
  ventaIds: string[]
): Promise<Record<string, VentaDetalle[]>> => {
  if (ventaIds.length === 0) return {};

  try {
    const chunks: string[][] = [];
    for (let i = 0; i < ventaIds.length; i += IN_QUERY_MAX) {
      chunks.push(ventaIds.slice(i, i + IN_QUERY_MAX));
    }

    const snapshots = await Promise.all(
      chunks.map((chunk) =>
        getDocs(
          query(
            collection(db, "ventas_detalle"),
            where("negocio_id", "==", negocioId),
            where("venta_id", "in", chunk)
          )
        )
      )
    );

    const detallesPorVenta: Record<string, VentaDetalle[]> = {};
    for (const snapshot of snapshots) {
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const detalle = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as VentaDetalle;
        (detallesPorVenta[detalle.venta_id] ??= []).push(detalle);
      }
    }
    return detallesPorVenta;
  } catch (error) {
    console.error("Error al obtener detalles de ventas en lote:", error);
    throw new Error("No se pudieron obtener los detalles de venta");
  }
};

export const getDetallesByVenta = async (
  ventaId: string,
  negocioId: string
): Promise<VentaDetalle[]> => {
  try {
    const q = query(
      collection(db, "ventas_detalle"),
      where("negocio_id", "==", negocioId),
      where("venta_id", "==", ventaId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as VentaDetalle;
    });
  } catch (error) {
    console.error("Error al obtener detalles de venta:", error);
    throw new Error("No se pudieron obtener los detalles de venta");
  }
};
