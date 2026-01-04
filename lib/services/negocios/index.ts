import { CreateNegocioInput, Negocio, UpdateNegocioInput } from '@/interface';
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
} from 'firebase/firestore';

/**
 * Crear un nuevo negocio
 */
export const createNegocio = async (negocioData: CreateNegocioInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'negocios'), {
      ...negocioData,
      activo: negocioData.activo ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear negocio:', error);
    throw new Error('No se pudo crear el negocio');
  }
};

/**
 * Obtener un negocio por ID
 */
export const getNegocioById = async (id: string): Promise<Negocio | null> => {
  try {
    const docRef = doc(db, 'negocios', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Negocio;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener negocio:', error);
    throw new Error('No se pudo obtener el negocio');
  }
};

/**
 * Obtener todos los negocios
 */
export const getAllNegocios = async (): Promise<Negocio[]> => {
  try {
    const q = query(collection(db, 'negocios'), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Negocio;
    });
  } catch (error) {
    console.error('Error al obtener negocios:', error);
    throw new Error('No se pudieron obtener los negocios');
  }
};

/**
 * Actualizar un negocio
 */
export const updateNegocio = async (
  id: string,
  negocioData: UpdateNegocioInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'negocios', id);
    await updateDoc(docRef, {
      ...negocioData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar negocio:', error);
    throw new Error('No se pudo actualizar el negocio');
  }
};

/**
 * Eliminar un negocio
 */
export const deleteNegocio = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'negocios', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar negocio:', error);
    throw new Error('No se pudo eliminar el negocio');
  }
};
