import { CreateVentaInput, UpdateVentaInput, Venta } from '@/interface';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';

function docToVenta(snap: QueryDocumentSnapshot<DocumentData>): Venta {
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    fecha: data.fecha?.toDate(),
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as Venta;
}

function sortByFechaDesc(ventas: Venta[]): Venta[] {
  return ventas.sort((a, b) => {
    const fa = a.fecha instanceof Date ? a.fecha.getTime() : 0;
    const fb = b.fecha instanceof Date ? b.fecha.getTime() : 0;
    return fb - fa;
  });
}

export const createVenta = async (ventaData: CreateVentaInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'ventas'), {
      ...ventaData,
      fecha: ventaData.fecha ? Timestamp.fromDate(ventaData.fecha) : Timestamp.now(),
      estado: ventaData.estado ?? 'PENDIENTE',
      tipo_venta: ventaData.tipo_venta ?? 'CONTADO',
      descuento: ventaData.descuento ?? 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw new Error('No se pudo crear la venta');
  }
};

export const getVentaById = async (id: string): Promise<Venta | null> => {
  try {
    const docRef = doc(db, 'ventas', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      fecha: data.fecha?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Venta;
  } catch (error) {
    console.error('Error al obtener venta:', error);
    throw new Error('No se pudo obtener la venta');
  }
};

export const getAllVentas = async (): Promise<Venta[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'ventas'));
    return sortByFechaDesc(snapshot.docs.map(docToVenta));
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
};

export const getVentasByNegocio = async (negocio_id: string): Promise<Venta[]> => {
  try {
    const q = query(
      collection(db, 'ventas'),
      where('negocio_id', '==', negocio_id),
    );
    const snapshot = await getDocs(q);
    return sortByFechaDesc(snapshot.docs.map(docToVenta));
  } catch (error) {
    console.error('Error al obtener ventas por negocio:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
};

export const getVentasBySucursal = async (sucursal_id: string): Promise<Venta[]> => {
  try {
    const q = query(
      collection(db, 'ventas'),
      where('sucursal_id', '==', sucursal_id),
    );
    const snapshot = await getDocs(q);
    return sortByFechaDesc(snapshot.docs.map(docToVenta));
  } catch (error) {
    console.error('Error al obtener ventas por sucursal:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
};

export const getVentasByEstado = async (
  negocio_id: string,
  estado: string,
): Promise<Venta[]> => {
  try {
    const q = query(
      collection(db, 'ventas'),
      where('negocio_id', '==', negocio_id),
      where('estado', '==', estado),
    );
    const snapshot = await getDocs(q);
    return sortByFechaDesc(snapshot.docs.map(docToVenta));
  } catch (error) {
    console.error('Error al obtener ventas por estado:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
};

export const updateVenta = async (
  id: string,
  ventaData: UpdateVentaInput,
): Promise<void> => {
  try {
    const docRef = doc(db, 'ventas', id);
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
 * Listener en tiempo real para ventas de un negocio.
 * Cada vez que se crea/modifica/elimina una venta, llama al callback con la lista actualizada.
 */
export function onVentasByNegocio(
  negocio_id: string,
  callback: (ventas: Venta[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'ventas'),
    where('negocio_id', '==', negocio_id),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const ventas = sortByFechaDesc(snapshot.docs.map(docToVenta));
      callback(ventas);
    },
    (error) => {
      console.error('Error en listener de ventas:', error);
      onError?.(error);
    },
  );
}
