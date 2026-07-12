import { CreateVentaDetalleInput, VentaDetalle } from "@/interface";
import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs, query, Timestamp, where } from "firebase/firestore";

export const createVentaDetalle = async (detalleData: CreateVentaDetalleInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "ventas_detalle"), {
      ...detalleData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear detalle de venta:", error);
    throw new Error("No se pudo crear el detalle de venta");
  }
};

// Firestore limita los operadores 'in' a 10 valores por consulta.
const IN_QUERY_MAX = 10;

/**
 * Obtiene los detalles de varias ventas en lotes (`where venta_id in [...]`),
 * evitando el patrón N+1 de una consulta por venta.
 *
 * @param ventaIds - IDs de las ventas a consultar
 * @returns Mapa venta_id → detalles (las ventas sin detalles no aparecen en el mapa)
 */
export const getDetallesByVentaIds = async (
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
        getDocs(query(collection(db, "ventas_detalle"), where("venta_id", "in", chunk)))
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

export const getDetallesByVenta = async (venta_id: string): Promise<VentaDetalle[]> => {
  try {
    const q = query(collection(db, "ventas_detalle"), where("venta_id", "==", venta_id));

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
