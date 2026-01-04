import { CreateSucursalInput, Sucursal, UpdateSucursalInput } from '@/interface/sucursales';
import { db } from '@/lib/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
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
 * Crear una nueva sucursal
 */
export const createSucursal = async (sucursalData: CreateSucursalInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'sucursales'), {
      ...sucursalData,
      activo: sucursalData.activo ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear sucursal:', error);
    throw new Error('No se pudo crear la sucursal');
  }
};

/**
 * Obtener una sucursal por ID
 */
export const getSucursalById = async (id: string): Promise<Sucursal | null> => {
  try {
    const docRef = doc(db, 'sucursales', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Sucursal;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    throw new Error('No se pudo obtener la sucursal');
  }
};

/**
 * Obtener todas las sucursales
 */
export const getAllSucursales = async (): Promise<Sucursal[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'sucursales'));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Sucursal;
    });
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    throw new Error('No se pudieron obtener las sucursales');
  }
};

/**
 * Obtener sucursales por negocio_id
 */
export const getSucursalesByNegocio = async (negocio_id: string): Promise<Sucursal[]> => {
  try {
    const q = query(
      collection(db, 'sucursales'),
      where('negocio_id', '==', negocio_id),
      where('activo', '==', true),
      orderBy('nombre', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Sucursal;
    });
  } catch (error) {
    console.error('Error al obtener sucursales por negocio:', error);
    throw new Error('No se pudieron obtener las sucursales');
  }
};

/**
 * Actualizar una sucursal
 */
export const updateSucursal = async (
  id: string,
  sucursalData: UpdateSucursalInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'sucursales', id);
    await updateDoc(docRef, {
      ...sucursalData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar sucursal:', error);
    throw new Error('No se pudo actualizar la sucursal');
  }
};

/**
 * Eliminar una sucursal
 */
export const deleteSucursal = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'sucursales', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    throw new Error('No se pudo eliminar la sucursal');
  }
};
