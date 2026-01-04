import { CreateVentaPagoInput, UpdateVentaPagoInput, VentaPago } from '@/interface';
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
 * Crear un nuevo pago de venta
 */
export const createVentaPago = async (pagoData: CreateVentaPagoInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'ventas_pagos'), {
      ...pagoData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear pago de venta:', error);
    throw new Error('No se pudo crear el pago de venta');
  }
};

/**
 * Obtener un pago por ID
 */
export const getVentaPagoById = async (id: string): Promise<VentaPago | null> => {
  try {
    const docRef = doc(db, 'ventas_pagos', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as VentaPago;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener pago de venta:', error);
    throw new Error('No se pudo obtener el pago de venta');
  }
};

/**
 * Obtener todos los pagos de una venta
 */
export const getPagosByVenta = async (venta_id: string): Promise<VentaPago[]> => {
  try {
    const q = query(
      collection(db, 'ventas_pagos'),
      where('venta_id', '==', venta_id)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as VentaPago;
    });
  } catch (error) {
    console.error('Error al obtener pagos de venta:', error);
    throw new Error('No se pudieron obtener los pagos de venta');
  }
};

/**
 * Actualizar un pago de venta
 */
export const updateVentaPago = async (
  id: string,
  pagoData: UpdateVentaPagoInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'ventas_pagos', id);
    await updateDoc(docRef, {
      ...pagoData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar pago de venta:', error);
    throw new Error('No se pudo actualizar el pago de venta');
  }
};

/**
 * Eliminar un pago de venta
 */
export const deleteVentaPago = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'ventas_pagos', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar pago de venta:', error);
    throw new Error('No se pudo eliminar el pago de venta');
  }
};
