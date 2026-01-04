import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { auth } from './firebase';

// Validaciones
const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'El email es requerido';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'El email no es válido';
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'La contraseña es requerida';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return null;
};

const validateAuthForm = (email: string, password: string): string | null => {
  const emailError = validateEmail(email);
  if (emailError) return emailError;
  
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  
  return null;
};

// Traducir errores de Firebase a español
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
      return error.message || 'Error al autenticar';
  }
};

// Funciones de autenticación
const signInWithFirebase = async (email: string, password: string): Promise<UserCredential> => {
  const validationError = validateAuthForm(email, password);
  if (validationError) {
    throw new Error(validationError);
  }
  
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

const signUpWithFirebase = async (email: string, password: string): Promise<UserCredential> => {
  const validationError = validateAuthForm(email, password);
  if (validationError) {
    throw new Error(validationError);
  }
  
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

// Handlers completos con navegación
export const handleSignIn = async (email: string, password: string, router: any): Promise<string | null> => {
  try {
    const userCredential = await signInWithFirebase(email, password);
    if (userCredential.user) {
      router.replace('/ventas');
      return null;
    }
    return 'Error al iniciar sesión';
  } catch (error: any) {
    console.log(error);
    return error.message || 'Error al iniciar sesión';
  }
};

export const handleSignUp = async (email: string, password: string, router: any): Promise<string | null> => {
  try {
    const userCredential = await signUpWithFirebase(email, password);
    if (userCredential.user) {
      router.replace('/ventas');
      return null;
    }
    return 'Error al registrar';
  } catch (error: any) {
    console.log(error);
    return error.message || 'Error al registrar';
  }
};
