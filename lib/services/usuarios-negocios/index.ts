import {
  CreateUsuarioNegocioInput,
  UpdateUsuarioNegocioInput,
  UsuarioNegocio,
} from '@/interface';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

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

export const updateUsuarioNegocio = async (
  id: string,
  usuarioNegocioData: UpdateUsuarioNegocioInput
): Promise<void> => {
  try {
    const docRef = doc(db, 'usuarios_negocios', id);
    await updateDoc(docRef, {
      ...usuarioNegocioData,
    } as Record<string, unknown>);
  } catch (error) {
    console.error('Error al actualizar relación usuario-negocio:', error);
    throw new Error('No se pudo actualizar la relación usuario-negocio');
  }
};

/**
 * Obtener el negocio del usuario por UID de Auth o email.
 * Intenta primero con el UID de Auth, si no encuentra, busca por email en Firestore.
 */
export const getNegocioIdByUsuario = async (
  userId: string,
  userEmail: string
): Promise<string | null> => {
  try {
    let negociosUsuario = await getNegociosByUsuario(userId);
    
    if (!negociosUsuario.length) {
      const usuariosSnapshot = await getDocs(
        query(collection(db, 'usuarios'), where('email', '==', userEmail))
      );
      
      if (!usuariosSnapshot.empty) {
        negociosUsuario = await getNegociosByUsuario(usuariosSnapshot.docs[0].id);
      }
    }
    
    return negociosUsuario.length > 0 ? negociosUsuario[0].negocio_id : null;
  } catch (error) {
    console.error('Error al obtener negocio del usuario:', error);
    throw new Error('No se pudo obtener el negocio del usuario');
  }
};
