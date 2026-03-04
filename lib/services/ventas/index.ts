import { CreateVentaInput, UpdateVentaInput, Venta } from '@/interface';
import { db } from '@/lib/firebase';
import { createConverter } from '@/lib/utils/firestore-converter';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';

const ventaConverter = createConverter<Venta>();

/**
 * Sorts an array of Venta objects by their creation date in descending order.
 * Ensures the most recent sales appear first in lists and reports.
 * 
 * @param ventas - Array of sales to sort
 * @returns Sorted array of sales (newest first)
 */
function sortByFechaDesc(ventas: Venta[]): Venta[] {
  return ventas.sort((a, b) => {
    const fa = a.fecha instanceof Date ? a.fecha.getTime() : 0;
    const fb = b.fecha instanceof Date ? b.fecha.getTime() : 0;
    return fb - fa;
  });
}

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
      estado: ventaData.estado ?? 'PENDIENTE',
      tipo_venta: ventaData.tipo_venta ?? 'CONTADO',
      descuento: ventaData.descuento ?? 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Casting to 'any' is required to bypass the ID requirement on creation while using converters
    const docRef = await addDoc(collection(db, 'ventas').withConverter(ventaConverter), cleanData as any);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw new Error('No se pudo crear la venta');
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
export const updateVenta = async (
  id: string,
  ventaData: UpdateVentaInput,
): Promise<void> => {
  try {
    const docRef = doc(db, 'ventas', id).withConverter(ventaConverter);
    await updateDoc(docRef, {
      ...ventaData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar venta:', error);
    throw new Error('No se pudo actualizar la venta');
  }
};

/**
 * Sets up a real-time listener for all sales belonging to a specific business.
 * Used to populate UI dashboards that need to reflect new sales instantly.
 * 
 * @param negocio_id - The ID of the business to monitor
 * @param callback - Function executed every time the data changes
 * @param onError - Optional callback for handling listener errors
 * @returns An Unsubscribe function to detach the listener and prevent memory leaks
 */
export function onVentasByNegocio(
  negocio_id: string,
  callback: (ventas: Venta[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'ventas').withConverter(ventaConverter),
    where('negocio_id', '==', negocio_id),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const ventas = sortByFechaDesc(snapshot.docs.map((doc) => doc.data()));
      callback(ventas);
    },
    (error) => {
      console.error('Error en listener de ventas:', error);
      onError?.(error);
    },
  );
}
