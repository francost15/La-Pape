import { auth, db } from '@/lib/firebase';
import { getUsuarioById, getUsuarioByEmail } from '@/lib/services/usuarios';
import { getNegocioIdByUsuario } from '@/lib/services/usuarios-negocios';
import { getSucursalesByNegocio } from '@/lib/services/sucursales';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { create } from 'zustand';

interface SessionStore {
  userId: string | null;
  userEmail: string | null;
  displayName: string | null;
  photoURL: string | null;
  negocioId: string | null;
  sucursalId: string | null;
  ready: boolean;
  error: string | null;

  hydrate: (user: User) => Promise<void>;
  clear: () => void;
}

const initialState = {
  userId: null,
  userEmail: null,
  displayName: null,
  photoURL: null,
  negocioId: null,
  sucursalId: null,
  ready: false,
  error: null,
};

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialState,

  hydrate: async (user: User) => {
    const uid = user.uid;
    const email = user.email ?? '';
    const displayName = user.displayName ?? null;
    const photoURL = user.photoURL ?? null;

    set({ userId: uid, userEmail: email, displayName, photoURL, error: null });

    try {
      const negocioId = await getNegocioIdByUsuario(uid, email);

      if (!negocioId) {
        set({ ready: true, error: 'No tienes un negocio asignado' });
        return;
      }

      let usuarioDoc = await getUsuarioById(uid);
      if (!usuarioDoc && email) {
        usuarioDoc = await getUsuarioByEmail(email);
      }
      if (!usuarioDoc) {
        try {
          await setDoc(doc(db, 'usuarios', uid), {
            email: email.toLowerCase(),
            nombre: (displayName ?? email.split('@')[0] ?? 'Usuario').trim(),
            rol: 'VENDEDOR',
            activo: true,
            createdAt: Timestamp.now(),
          });
        } catch (e) {
          console.warn('No se pudo crear doc usuarios en hydrate:', e);
        }
      }

      let sucursalId: string | null = null;
      try {
        const sucursales = await getSucursalesByNegocio(negocioId);
        sucursalId = sucursales.length > 0 ? sucursales[0].id : null;
      } catch {
        console.warn('No se pudieron obtener sucursales, continuando sin sucursal');
      }

      set({ negocioId, sucursalId, ready: true });
    } catch (err) {
      console.error('Error al hidratar sesión:', err);
      set({ ready: true, error: 'Error al cargar datos del negocio' });
    }
  },

  clear: () => set(initialState),
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
