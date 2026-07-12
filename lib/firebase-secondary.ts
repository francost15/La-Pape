import { getApps, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, inMemoryPersistence } from "firebase/auth";

const SECONDARY_APP_NAME = "firebase-secondary-create-user";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECTID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.EXPO_PUBLIC_APPID,
};

/**
 * Obtiene una instancia de Auth secundaria para crear usuarios sin cerrar
 * la sesión actual. Úsala para flows de alta de usuarios desde el admin.
 *
 * Persistencia en memoria a propósito: la sesión del usuario recién creado
 * es efímera y no debe sobrevivir al flujo de alta ni persistirse en disco.
 */
export function getSecondaryAuth() {
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  if (existing) {
    return getAuth(existing);
  }
  const app = initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  return initializeAuth(app, { persistence: inMemoryPersistence });
}
