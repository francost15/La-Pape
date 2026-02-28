import type { UserRole, UsuarioNegocio } from "@/interface";
import { notify } from "@/lib/notify";
import {
  getUsuariosByNegocio,
  updateUsuarioNegocio,
} from "@/lib/services/usuarios-negocios";
import { getUsuarioByEmail, getUsuarioById, updateUsuario } from "@/lib/services/usuarios";
import { create } from "zustand";

export interface MiembroConUsuario {
  relacion: UsuarioNegocio;
  nombre: string;
  email: string;
  rol: UserRole;
  foto?: string;
  inicial: string;
}

export interface AuthUserOverride {
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface EquipoStore {
  miembros: MiembroConUsuario[];
  loading: boolean;
  error: string | null;

  loadMiembros: (
    negocioId: string | null,
    authOverride?: AuthUserOverride,
  ) => Promise<void>;
  updateRol: (relId: string, userId: string, email: string | undefined, rol: UserRole) => Promise<void>;
  removeMiembro: (relId: string) => Promise<void>;
  addMiembro: (miembro: MiembroConUsuario) => void;
  clear: () => void;
}

const initialState = {
  miembros: [],
  loading: false,
  error: null,
};

export const useEquipoStore = create<EquipoStore>((set, get) => ({
  ...initialState,

  loadMiembros: async (negocioId, authOverride) => {
    if (!negocioId) {
      set({ miembros: [], loading: false, error: null });
      return;
    }
    set({ loading: true, error: null });
    try {
      const relaciones = await getUsuariosByNegocio(negocioId);
      const result = await Promise.all(
        relaciones.map(async (rel) => {
          let u = await getUsuarioById(rel.usuario_id);
          const isCurrentUser = authOverride && rel.usuario_id === authOverride.userId;
          if (!u && isCurrentUser && authOverride?.email) {
            u = await getUsuarioByEmail(authOverride.email);
          }
          const nombre =
            u?.nombre?.trim() ||
            (isCurrentUser && authOverride?.displayName
              ? authOverride.displayName
              : null) ||
            u?.email?.split("@")[0] ||
            "Usuario";
          const email = u?.email ?? "";
          const rol: UserRole = (u as { rol?: UserRole })?.rol ?? "VENDEDOR";
          const inicial = (nombre[0] ?? "?").toUpperCase();
          const foto =
            (u as { foto?: string })?.foto ??
            (isCurrentUser && authOverride?.photoURL ? authOverride.photoURL : undefined);
          return {
            relacion: rel,
            nombre,
            email,
            rol,
            foto,
            inicial,
          } satisfies MiembroConUsuario;
        }),
      );
      set({
        miembros: result.sort((a, b) => a.nombre.localeCompare(b.nombre)),
        loading: false,
        error: null,
      });
    } catch {
      set({ loading: false, error: "No se pudieron cargar los miembros" });
      notify.error({ title: "No se pudieron cargar los miembros" });
    }
  },

  updateRol: async (relId, userId, email, rol) => {
    await updateUsuario(userId, { rol }, email);
    set((state) => ({
      miembros: state.miembros.map((m) =>
        m.relacion.id === relId ? { ...m, rol } : m,
      ),
    }));
  },

  removeMiembro: async (relId) => {
    await updateUsuarioNegocio(relId, { activo: false });
    set((state) => ({
      miembros: state.miembros.filter((m) => m.relacion.id !== relId),
    }));
  },

  addMiembro: (miembro) => {
    set((state) => ({
      miembros: [...state.miembros, miembro].sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      ),
    }));
  },

  clear: () => set(initialState),
}));
