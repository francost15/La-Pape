import { CreateVentaInput, UpdateVentaInput, Venta } from "@/interface";
import { db } from "@/lib/firebase";
import { createConverter } from "@/lib/utils/firestore-converter";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";

const ventaConverter = createConverter<Venta>();

/** Opciones para acotar el listener de ventas en el servidor. */
export interface VentasQueryOptions {
  /** Límite inferior del rango de fechas (inclusivo). */
  desde?: Date;
  /** Límite superior del rango de fechas (inclusivo). */
  hasta?: Date;
  /** Máximo de documentos a escuchar cuando no hay rango de fechas. */
  limitCount?: number;
}

// Tope por defecto: evita descargar el historial completo de negocios con años
// de ventas cuando el consumidor no acota por fechas.
const DEFAULT_VENTAS_LIMIT = 200;

/**
 * Creates a new base sale document in Firestore.
 * This is typically the first step before adding sale details (items) and payments.
 *
 * @param ventaData - The required data to initialize a sale
 * @returns The ID of the newly created sale document
 * @throws Error if the insertion into Firestore fails
 */
export const createVenta = async (ventaData: CreateVentaInput): Promise<string> => {
  try {
    const cleanData = {
      ...ventaData,
      fecha: ventaData.fecha ? Timestamp.fromDate(ventaData.fecha) : Timestamp.now(),
      estado: ventaData.estado ?? "PENDIENTE",
      tipo_venta: ventaData.tipo_venta ?? "CONTADO",
      descuento: ventaData.descuento ?? 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Casting to 'any' is required to bypass the ID requirement on creation while using converters
    const docRef = await addDoc(
      collection(db, "ventas").withConverter(ventaConverter),
      cleanData as any
    );
    return docRef.id;
  } catch (error) {
    console.error("Error al crear venta:", error);
    throw new Error("No se pudo crear la venta");
  }
};

/**
 * Updates an existing sale document.
 * Often used to change the sale status (e.g., from PENDIENTE to PAGADA or CANCELADA).
 *
 * @param id - The Firestore document ID of the sale
 * @param ventaData - Partial data to update
 * @throws Error if the update operation fails
 */
export const updateVenta = async (id: string, ventaData: UpdateVentaInput): Promise<void> => {
  try {
    const docRef = doc(db, "ventas", id).withConverter(ventaConverter);
    await updateDoc(docRef, {
      ...ventaData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error al actualizar venta:", error);
    throw new Error("No se pudo actualizar la venta");
  }
};

/**
 * Sets up a real-time listener for the sales of a specific business, ordered
 * by date (newest first) on the server.
 *
 * The query is bounded to keep reads cheap: callers can pass a date range
 * (`desde`/`hasta`) matching the active period filter; without a range the
 * listener falls back to the most recent `limitCount` sales.
 *
 * Requires the composite index `negocio_id ASC, fecha DESC` (see
 * firestore.indexes.json).
 *
 * @param negocio_id - The ID of the business to monitor
 * @param callback - Function executed every time the data changes
 * @param onError - Optional callback for handling listener errors
 * @param options - Optional date range and/or document limit
 * @returns An Unsubscribe function to detach the listener and prevent memory leaks
 */
export function onVentasByNegocio(
  negocio_id: string,
  callback: (ventas: Venta[]) => void,
  onError?: (error: Error) => void,
  options: VentasQueryOptions = {}
): Unsubscribe {
  const constraints: QueryConstraint[] = [
    where("negocio_id", "==", negocio_id),
    orderBy("fecha", "desc"),
  ];

  if (options.desde) {
    constraints.push(where("fecha", ">=", Timestamp.fromDate(options.desde)));
  }
  if (options.hasta) {
    constraints.push(where("fecha", "<=", Timestamp.fromDate(options.hasta)));
  }
  // Sin rango de fechas se necesita un tope duro para no descargar todo el historial.
  if (options.limitCount || (!options.desde && !options.hasta)) {
    constraints.push(limit(options.limitCount ?? DEFAULT_VENTAS_LIMIT));
  }

  const q = query(collection(db, "ventas").withConverter(ventaConverter), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      // El orden ya viene garantizado por orderBy('fecha','desc') en el servidor.
      callback(snapshot.docs.map((doc) => doc.data()));
    },
    (error) => {
      console.error("Error en listener de ventas:", error);
      onError?.(error);
    }
  );
}
