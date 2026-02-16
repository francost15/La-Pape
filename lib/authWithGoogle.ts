import { FirebaseError } from "firebase/app";
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  UserCredential,
} from "firebase/auth";
import { Platform } from "react-native";
import { auth } from "./firebase";

const getGoogleAuthErrorMessage = (error: unknown): string => {
  if (!(error instanceof FirebaseError)) {
    return "Ocurrió un error inesperado";
  }
  switch (error.code) {
    case "auth/popup-closed-by-user":
      return "Cerraste la ventana. Intenta de nuevo.";
    case "auth/popup-blocked":
      return "El navegador bloqueó la ventana. Permite ventanas emergentes.";
    case "auth/cancelled-popup-request":
      return "Se canceló el inicio de sesión.";
    case "auth/account-exists-with-different-credential":
      return "Este email ya está registrado con otro método. Usa email y contraseña.";
    case "auth/network-request-failed":
      return "Error de conexión. Verifica tu internet.";
    default:
      return error.message ?? "Error al iniciar sesión con Google";
  }
};

/**
 * Inicia sesión con Google (solo web).
 * Usa popup; si el navegador lo bloquea, usa redirect.
 * En iOS/Android con Expo hace falta expo-auth-session + signInWithCredential.
 */
export async function signInWithGoogle(): Promise<UserCredential | null> {
  if (Platform.OS !== "web") {
    throw new Error(
      "Inicio de sesión con Google en esta plataforma requiere configuración adicional."
    );
  }
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === "auth/popup-blocked"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw new Error(getGoogleAuthErrorMessage(error));
  }
}

/**
 * Obtiene el resultado tras volver de signInWithRedirect (solo web).
 * Llamar al montar la pantalla de login en web.
 */
export async function getGoogleRedirectResult(): Promise<UserCredential | null> {
  if (Platform.OS !== "web") return null;
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    throw new Error(getGoogleAuthErrorMessage(error));
  }
}
