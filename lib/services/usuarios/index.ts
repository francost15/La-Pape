import type { UserRole } from '@/interface';
import { CreateUsuarioInput, UpdateUsuarioInput, Usuario } from '@/interface';
import { db } from '@/lib/firebase';
import { getSecondaryAuth } from '@/lib/firebase-secondary';
import { createUsuarioNegocio } from '@/lib/services/usuarios-negocios';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
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
 * Crear usuario con ID específico (para vincular doc id = Auth UID)
 */
export const createUsuarioWithId = async (
  id: string,
  usuarioData: Omit<CreateUsuarioInput, 'password'> & { password?: string }
): Promise<void> => {
  try {
    const { password: _pw, ...safeData } = usuarioData;
    const docRef = doc(db, 'usuarios', id);
    await setDoc(docRef, {
      ...safeData,
      activo: usuarioData.activo ?? true,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw new Error('No se pudo crear el usuario');
  }
};

export interface CreateUserWithAuthInput {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  rol: UserRole;
  negocioId: string;
}

/**
 * Crea usuario en Firebase Auth + Firestore y lo vincula al negocio.
 * Usa Auth secundaria para no cerrar la sesión del admin.
 */
export const createUserWithAuthAndLink = async (
  input: CreateUserWithAuthInput
): Promise<string> => {
  const secondaryAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(
    secondaryAuth,
    input.email.trim().toLowerCase(),
    input.password,
  );
  const uid = cred.user.uid;
  await signOut(secondaryAuth);

  await createUsuarioWithId(uid, {
    email: input.email.trim().toLowerCase(),
    nombre: input.nombre.trim(),
    ...(input.telefono?.trim() ? { telefono: input.telefono.trim() } : {}),
    rol: input.rol,
    activo: true,
  });

  await createUsuarioNegocio({
    negocio_id: input.negocioId,
    usuario_id: uid,
  });

  return uid;
};

/**
 * Obtener un usuario por email (útil cuando el doc id no coincide con Auth UID)
 */
export const getUsuarioByEmail = async (email: string): Promise<Usuario | null> => {
  if (!email?.trim()) return null;
  try {
    const q = query(
      collection(db, 'usuarios'),
      where('email', '==', email.trim())
    );
    const snapshot = await getDocs(q);
    const docSnap = snapshot.docs[0];
    if (!docSnap?.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.(),
      last_login: data.last_login?.toDate?.(),
    } as Usuario;
  } catch {
    return null;
  }
};

/**
 * Obtener un usuario por ID (doc id = Auth UID cuando se creó con setDoc)
 * Si no se encuentra, intenta por email cuando es el usuario actual.
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
 * Resuelve el ID real del documento en usuarios.
 * Primero intenta por id; si no existe y hay email, busca por email.
 */
export const resolveUsuarioDocId = async (
  id: string,
  email?: string
): Promise<string | null> => {
  const docRef = doc(db, 'usuarios', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return id;
  if (email?.trim()) {
    const u = await getUsuarioByEmail(email);
    return u?.id ?? null;
  }
  return null;
};

/**
 * Actualizar un usuario.
 * Acepta id (Auth UID o doc id) y email opcional para resolver el doc si id no existe.
 */
export const updateUsuario = async (
  id: string,
  usuarioData: UpdateUsuarioInput,
  email?: string
): Promise<void> => {
  const docId = await resolveUsuarioDocId(id, email);
  if (!docId) {
    throw new Error('Usuario no encontrado');
  }
  try {
    const docRef = doc(db, 'usuarios', docId);
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
