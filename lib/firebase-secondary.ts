import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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
 */
export function getSecondaryAuth() {
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  const app = existing ?? initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  return getAuth(app);
}
