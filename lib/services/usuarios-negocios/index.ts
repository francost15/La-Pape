import {
    CreateUsuarioNegocioInput,
    UpdateUsuarioNegocioInput,
    UsuarioNegocio,
} from '@/interface/usuarios-negocios';
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
 * Crear una nueva relación usuario-negocio
 */
export const createUsuarioNegocio = async (
  usuarioNegocioData: CreateUsuarioNegocioInput
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'usuarios_negocios'), {
      ...usuarioNegocioData,
      activo: usuarioNegocioData.activo ?? true,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear relación usuario-negocio:', error);
    throw new Error('No se pudo crear la relación usuario-negocio');
  }
};

/**
 * Obtener una relación por ID
 */
export const getUsuarioNegocioById = async (
  id: string
): Promise<UsuarioNegocio | null> => {
  try {
    const docRef = doc(db, 'usuarios_negocios', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as UsuarioNegocio;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener relación usuario-negocio:', error);
    throw new Error('No se pudo obtener la relación usuario-negocio');
  }
};

/**
 * Obtener todos los negocios de un usuario
 */
export const getNegociosByUsuario = async (
  usuario_id: string
): Promise<UsuarioNegocio[]> => {
  try {
    const q = query(
      collection(db, 'usuarios_negocios'),
      where('usuario_id', '==', usuario_id),
      where('activo', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as UsuarioNegocio;
    });
  } catch (error) {
    console.error('Error al obtener negocios por usuario:', error);
    throw new Error('No se pudieron obtener los negocios');
  }
};

/**
 * Obtener todos los usuarios de un negocio
 */
export const getUsuariosByNegocio = async (
  negocio_id: string
): Promise<UsuarioNegocio[]> => {
  try {
    const q = query(
      collection(db, 'usuarios_negocios'),
      where('negocio_id', '==', negocio_id),
      where('activo', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as UsuarioNegocio;
    });
  } catch (error) {
    console.error('Error al obtener usuarios por negocio:', error);
    throw new Error('No se pudieron obtener los usuarios');
  }
};

/**
 * Actualizar una relación usuario-negocio
 */
export const updateUsuarioNegocio = async (
  id: string,
  usuarioNegocioData: UpdateUsuarioNegocioInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios_negocios', id);
    await updateDoc(docRef, {
      ...usuarioNegocioData,
    } as any);
  } catch (error) {
    console.error('Error al actualizar relación usuario-negocio:', error);
    throw new Error('No se pudo actualizar la relación usuario-negocio');
  }
};

/**
 * Eliminar una relación usuario-negocio
 */
export const deleteUsuarioNegocio = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios_negocios', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar relación usuario-negocio:', error);
    throw new Error('No se pudo eliminar la relación usuario-negocio');
  }
};
