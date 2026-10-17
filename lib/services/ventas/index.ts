import { Venta } from "@/interface";
import type { VentasQueryOptions } from "@/interface/ventas";
import { db } from "@/lib/firebase";
import { createConverter } from "@/lib/utils/firestore-converter";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  QueryConstraint,
  Timestamp,
  Unsubscribe,
  where,
} from "firebase/firestore";

export type { VentasQueryOptions };

const ventaConverter = createConverter<Venta>();

// Tope por defecto: evita descargar el historial completo de negocios con años
// de ventas cuando el consumidor no acota por fechas.
const DEFAULT_VENTAS_LIMIT = 200;
// ponytail: tope fijo, subir si un período real lo rebalsa
const RANGO_VENTAS_LIMIT = 500;

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
  const cap = options.desde || options.hasta ? RANGO_VENTAS_LIMIT : DEFAULT_VENTAS_LIMIT;
  constraints.push(limit(options.limitCount ?? cap));

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
