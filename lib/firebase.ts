import { initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_AUTHDOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECTID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.EXPO_PUBLIC_APPID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREMENTID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// En React Native el SDK JS NO persiste la sesión por sí solo: hay que
// inicializar Auth con AsyncStorage o el usuario debe loguearse en cada
// arranque. El require dinámico es necesario porque el bundle web de
// firebase/auth no exporta getReactNativePersistence.
let authInstance: Auth;
if (Platform.OS === "web") {
  authInstance = getAuth(app);
} else {
  const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
export const auth = authInstance;

// Inicializar Base de Datos
export const db = getFirestore(app);
