import { CreateVentaInput, UpdateVentaInput, Venta } from '@/interface/ventas';
import { db } from '@/lib/firebase';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

/**
 * Crear una nueva venta
 */
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

/**
 * Obtener una venta por ID
 */
export const getVentaById = async (id: string): Promise<Venta | null> => {
  try {
    const docRef = doc(db, 'ventas', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        fecha: data.fecha?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Venta;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener venta:', error);
    throw new Error('No se pudo obtener la venta');
  }
};

/**
 * Obtener todas las ventas
 */
export const getAllVentas = async (): Promise<Venta[]> => {
  try {
    const q = query(collection(db, 'ventas'), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Venta;
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
};

/**
 * Obtener ventas por negocio_id
 */
export const getVentasByNegocio = async (negocio_id: string): Promise<Venta[]> => {
  try {
    const q = query(
      collection(db, 'ventas'),
      where('negocio_id', '==', negocio_id),
      orderBy('fecha', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Venta;
    });
  } catch (error) {
    console.error('Error al obtener ventas por negocio:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
};

/**
 * Obtener ventas por sucursal_id
 */
export const getVentasBySucursal = async (sucursal_id: string): Promise<Venta[]> => {
  try {
    const q = query(
      collection(db, 'ventas'),
      where('sucursal_id', '==', sucursal_id),
      orderBy('fecha', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Venta;
    });
  } catch (error) {
    console.error('Error al obtener ventas por sucursal:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
};

/**
 * Obtener ventas por estado
 */
export const getVentasByEstado = async (
  negocio_id: string,
  estado: string
): Promise<Venta[]> => {
  try {
    const q = query(
      collection(db, 'ventas'),
      where('negocio_id', '==', negocio_id),
      where('estado', '==', estado),
      orderBy('fecha', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Venta;
    });
  } catch (error) {
    console.error('Error al obtener ventas por estado:', error);
    throw new Error('No se pudieron obtener las ventas');
  }
};

/**
 * Actualizar una venta
 */
export const updateVenta = async (
  id: string,
  ventaData: UpdateVentaInput
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
