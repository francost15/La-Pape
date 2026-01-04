import { CreateUsuarioInput, UpdateUsuarioInput, Usuario } from '@/interface';
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
 * Crear un nuevo usuario
 * Nota: La autenticación se maneja en Firebase Auth, este servicio es para datos adicionales
 */
export const createUsuario = async (usuarioData: CreateUsuarioInput): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'usuarios'), {
      ...usuarioData,
      activo: usuarioData.activo ?? true,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw new Error('No se pudo crear el usuario');
  }
};

/**
 * Obtener un usuario por ID
 */
export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  try {
    const docRef = doc(db, 'usuarios', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        last_login: data.last_login?.toDate(),
      } as Usuario;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw new Error('No se pudo obtener el usuario');
  }
};

/**
 * Obtener todos los usuarios
 */
export const getAllUsuarios = async (): Promise<Usuario[]> => {
  try {
    const q = query(collection(db, 'usuarios'), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        last_login: data.last_login?.toDate(),
      } as Usuario;
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw new Error('No se pudieron obtener los usuarios');
  }
};

/**
 * Obtener usuarios activos
 */
export const getUsuariosActivos = async (): Promise<Usuario[]> => {
  try {
    const q = query(
      collection(db, 'usuarios'),
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
        last_login: data.last_login?.toDate(),
      } as Usuario;
    });
  } catch (error) {
    console.error('Error al obtener usuarios activos:', error);
    throw new Error('No se pudieron obtener los usuarios');
  }
};

/**
 * Actualizar un usuario
 */
export const updateUsuario = async (
  id: string,
  usuarioData: UpdateUsuarioInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios', id);
    await updateDoc(docRef, {
      ...usuarioData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw new Error('No se pudo actualizar el usuario');
  }
};

/**
 * Actualizar último login del usuario
 */
export const updateLastLogin = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios', id);
    await updateDoc(docRef, {
      last_login: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar último login:', error);
    throw new Error('No se pudo actualizar el último login');
  }
};

/**
 * Eliminar un usuario
 */
export const deleteUsuario = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw new Error('No se pudo eliminar el usuario');
  }
};
