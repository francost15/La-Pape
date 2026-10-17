import type { SessionStore, SucursalSesion } from "@/interface/session";
import { auth, db } from "@/lib/firebase";
import { getNegocioById } from "@/lib/services/negocios";
import { getUsuarioById, getUsuarioByEmail } from "@/lib/services/usuarios";
import { getNegocioIdByUsuario } from "@/lib/services/usuarios-negocios";
import { getSucursalesByNegocio } from "@/lib/services/sucursales";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { create } from "zustand";
import { useVentasStore } from "./ventas-store";

const initialState = {
  userId: null,
  userEmail: null,
  displayName: null,
  photoURL: null,
  usuarioDoc: null,
  negocioId: null,
  negocioNombre: null,
  sucursales: [] as SucursalSesion[],
  sucursalId: null,
  sucursalNombre: null,
  ready: false,
  error: null,
};

// Cada hydrate/clear incrementa la generación. Un hydrate en vuelo comprueba su
// generación tras cada await y aborta si otro hydrate o un logout empezó
// mientras tanto — evita que datos de una sesión ya cerrada pisen el estado.
let hydrateGen = 0;

/** Resuelve el doc de usuario, creándolo si aún no existe. */
async function resolveUsuarioDoc(uid: string, email: string, displayName: string | null) {
  let usuarioDoc = await getUsuarioById(uid);
  if (!usuarioDoc && email) {
    usuarioDoc = await getUsuarioByEmail(email);
  }
  if (!usuarioDoc) {
    try {
      await setDoc(doc(db, "usuarios", uid), {
        email: email.toLowerCase(),
        nombre: (displayName ?? email.split("@")[0] ?? "Usuario").trim(),
        rol: "VENDEDOR",
        activo: true,
        createdAt: Timestamp.now(),
      });
      usuarioDoc = await getUsuarioById(uid);
    } catch (e) {
      console.warn("No se pudo crear doc usuarios en hydrate:", e);
    }
  }
  return usuarioDoc;
}

function sucursalKey(negocioId: string): string {
  return `sucursal_activa_${negocioId}`;
}

async function resolveTenant(negocioId: string): Promise<{
  negocioNombre: string | null;
  sucursales: SucursalSesion[];
  sucursalId: string | null;
  sucursalNombre: string | null;
}> {
  const [negocio, sucursalesRaw, storedId] = await Promise.all([
    getNegocioById(negocioId).catch(() => null),
    getSucursalesByNegocio(negocioId).catch(() => []),
    AsyncStorage.getItem(sucursalKey(negocioId)).catch(() => null),
  ]);
  const sucursales = sucursalesRaw.map((sucursal) => ({
    id: sucursal.id,
    nombre: sucursal.nombre,
  }));
  const picked = sucursales.find((sucursal) => sucursal.id === storedId) ?? sucursales[0] ?? null;
  return {
    negocioNombre: negocio?.nombre || null,
    sucursales,
    sucursalId: picked?.id ?? null,
    sucursalNombre: picked?.nombre ?? null,
  };
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,

  hydrate: async (user: User) => {
    const gen = ++hydrateGen;
    const uid = user.uid;
    const email = user.email ?? "";
    const displayName = user.displayName ?? null;
    const photoURL = user.photoURL ?? null;

    set({ userId: uid, userEmail: email, displayName, photoURL, error: null });

    try {
      const negocioId = await getNegocioIdByUsuario(uid, email);
      if (gen !== hydrateGen) return;

      if (!negocioId) {
        set({
          ready: true,
          error: "No tienes un negocio asignado",
          negocioId: null,
          negocioNombre: null,
          sucursales: [],
          sucursalId: null,
          sucursalNombre: null,
        });
        return;
      }

      const [usuarioDoc, tenant] = await Promise.all([
        resolveUsuarioDoc(uid, email, displayName),
        resolveTenant(negocioId),
      ]);
      if (gen !== hydrateGen) return;

      set({ negocioId, usuarioDoc, ready: true, ...tenant });
    } catch (err) {
      if (gen !== hydrateGen) return;
      console.error("Error al hidratar sesión:", err);
      set({ ready: true, error: "Error al cargar datos del negocio" });
    }
  },

  setSucursal: (sucursalId) => {
    const sucursal = get().sucursales.find((item) => item.id === sucursalId);
    if (!sucursal) return;
    set({ sucursalId: sucursal.id, sucursalNombre: sucursal.nombre });
    const negocioId = get().negocioId;
    if (negocioId) {
      void AsyncStorage.setItem(sucursalKey(negocioId), sucursal.id);
    }
  },

  patchProfile: (data) => {
    set((state) => ({
      displayName: data.displayName !== undefined ? data.displayName : state.displayName,
      usuarioDoc:
        state.usuarioDoc && data.displayName
          ? { ...state.usuarioDoc, nombre: data.displayName }
          : state.usuarioDoc,
    }));
  },

  clear: () => {
    // Invalida cualquier hydrate en vuelo: sus `set` posteriores se descartan.
    hydrateGen++;
    useVentasStore.getState().clearCart();
    set(initialState);
  },
}));

/** Inicializa la escucha de auth y sincroniza la session store. */
export function initSessionListener(): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      useSessionStore.getState().hydrate(user);
    } else {
      useSessionStore.getState().clear();
    }
  });
}
