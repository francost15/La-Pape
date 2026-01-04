import {
    CreateVentaDetalleInput,
    UpdateVentaDetalleInput,
    VentaDetalle,
} from '@/interface/ventas-detalle';
import { db } from '@/lib/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

/**
 * Crear un nuevo detalle de venta
 */
export const createVentaDetalle = async (
  detalleData: CreateVentaDetalleInput
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'ventas_detalle'), {
      ...detalleData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear detalle de venta:', error);
    throw new Error('No se pudo crear el detalle de venta');
  }
};

/**
 * Obtener un detalle por ID
 */
export const getVentaDetalleById = async (id: string): Promise<VentaDetalle | null> => {
  try {
    const docRef = doc(db, 'ventas_detalle', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as VentaDetalle;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener detalle de venta:', error);
    throw new Error('No se pudo obtener el detalle de venta');
  }
};

/**
 * Obtener todos los detalles de una venta
 */
export const getDetallesByVenta = async (venta_id: string): Promise<VentaDetalle[]> => {
  try {
    const q = query(
      collection(db, 'ventas_detalle'),
      where('venta_id', '==', venta_id)
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
    console.error('Error al obtener detalles de venta:', error);
    throw new Error('No se pudieron obtener los detalles de venta');
  }
};

/**
 * Actualizar un detalle de venta
 */
export const updateVentaDetalle = async (
  id: string,
  detalleData: UpdateVentaDetalleInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'ventas_detalle', id);
    await updateDoc(docRef, detalleData);
  } catch (error) {
    console.error('Error al actualizar detalle de venta:', error);
    throw new Error('No se pudo actualizar el detalle de venta');
  }
};

/**
 * Eliminar un detalle de venta
 */
export const deleteVentaDetalle = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'ventas_detalle', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar detalle de venta:', error);
    throw new Error('No se pudo eliminar el detalle de venta');
  }
};
