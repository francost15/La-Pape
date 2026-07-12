import type { SessionStore } from "@/interface/session";
import { auth, db } from "@/lib/firebase";
import { getUsuarioById, getUsuarioByEmail } from "@/lib/services/usuarios";
import { getNegocioIdByUsuario } from "@/lib/services/usuarios-negocios";
import { getSucursalesByNegocio } from "@/lib/services/sucursales";
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
  sucursalId: null,
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

/** Primera sucursal del negocio, o null si no hay o falla. */
async function resolveSucursalId(negocioId: string): Promise<string | null> {
  try {
    const sucursales = await getSucursalesByNegocio(negocioId);
    return sucursales.length > 0 ? sucursales[0].id : null;
  } catch {
    console.warn("No se pudieron obtener sucursales, continuando sin sucursal");
    return null;
  }
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
        set({ ready: true, error: "No tienes un negocio asignado" });
        return;
      }

      // El doc de usuario y las sucursales son independientes: se resuelven en
      // paralelo para no encadenar round-trips y desbloquear `ready` antes.
      const [usuarioDoc, sucursalId] = await Promise.all([
        resolveUsuarioDoc(uid, email, displayName),
        resolveSucursalId(negocioId),
      ]);
      if (gen !== hydrateGen) return;

      set({ negocioId, sucursalId, usuarioDoc, ready: true });
    } catch (err) {
      if (gen !== hydrateGen) return;
      console.error("Error al hidratar sesión:", err);
      set({ ready: true, error: "Error al cargar datos del negocio" });
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
