import { auth } from '@/lib/firebase';
import { getNegocioIdByUsuario } from '@/lib/services/usuarios-negocios';
import { getSucursalesByNegocio } from '@/lib/services/sucursales';
import { onAuthStateChanged, User } from 'firebase/auth';
import { create } from 'zustand';

interface SessionStore {
  userId: string | null;
  userEmail: string | null;
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

    set({ userId: uid, userEmail: email, error: null });

    try {
      const negocioId = await getNegocioIdByUsuario(uid, email);

      if (!negocioId) {
        set({ ready: true, error: 'No tienes un negocio asignado' });
        return;
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
