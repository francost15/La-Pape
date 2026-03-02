import type { UserRole } from '@/interface';
import { UpdateUsuarioInput, Usuario } from '@/interface';
import { db } from '@/lib/firebase';
import { getSecondaryAuth } from '@/lib/firebase-secondary';
import { createUsuarioNegocio } from '@/lib/services/usuarios-negocios';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

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

  const safeData = {
    email: input.email.trim().toLowerCase(),
    nombre: input.nombre.trim(),
    ...(input.telefono?.trim() ? { telefono: input.telefono.trim() } : {}),
    rol: input.rol,
    activo: true,
  };

  const docRef = doc(db, 'usuarios', uid);
  await setDoc(docRef, {
    ...safeData,
    createdAt: Timestamp.now(),
  });

  await createUsuarioNegocio({
    negocio_id: input.negocioId,
    usuario_id: uid,
  });

  return uid;
};

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
