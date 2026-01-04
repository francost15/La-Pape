import { Cliente, CreateClienteInput, UpdateClienteInput } from '@/interface';
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
 * Crear un nuevo cliente
 */
export const createCliente = async (clienteData: CreateClienteInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'clientes'), {
      ...clienteData,
      activo: clienteData.activo ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw new Error('No se pudo crear el cliente');
  }
};

/**
 * Obtener un cliente por ID
 */
export const getClienteById = async (id: string): Promise<Cliente | null> => {
  try {
    const docRef = doc(db, 'clientes', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Cliente;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    throw new Error('No se pudo obtener el cliente');
  }
};

/**
 * Obtener todos los clientes
 */
export const getAllClientes = async (): Promise<Cliente[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'clientes'));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Cliente;
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw new Error('No se pudieron obtener los clientes');
  }
};

/**
 * Obtener clientes por negocio_id
 */
export const getClientesByNegocio = async (negocio_id: string): Promise<Cliente[]> => {
  try {
    const q = query(
      collection(db, 'clientes'),
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
      } as Cliente;
    });
  } catch (error) {
    console.error('Error al obtener clientes por negocio:', error);
    throw new Error('No se pudieron obtener los clientes');
  }
};

/**
 * Actualizar un cliente
 */
export const updateCliente = async (
  id: string,
  clienteData: UpdateClienteInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'clientes', id);
    await updateDoc(docRef, {
      ...clienteData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    throw new Error('No se pudo actualizar el cliente');
  }
};

/**
 * Eliminar un cliente
 */
export const deleteCliente = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'clientes', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    throw new Error('No se pudo eliminar el cliente');
  }
};
