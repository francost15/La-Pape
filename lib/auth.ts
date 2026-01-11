import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { auth } from './firebase';

// Traducción de errores Firebase
const getAuthErrorMessage = (error: unknown): string => {
  if (!(error instanceof FirebaseError)) {
    return 'Ocurrió un error inesperado';
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'El email no es válido';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada';
    case 'auth/user-not-found':
      return 'No existe una cuenta con este email';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'auth/email-already-in-use':
      return 'Este email ya está en uso';
    case 'auth/weak-password':
      return 'La contraseña es muy débil';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Intenta más tarde';
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos';
    default:
      return 'Error al autenticar';
  }
};

//  LOGIN
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

//  REGISTER
export const signUp = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};
