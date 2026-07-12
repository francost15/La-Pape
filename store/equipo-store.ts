import type { UserRole } from "@/interface";
import type { AuthUserOverride, EquipoStore, MiembroConUsuario } from "@/interface/equipo";
import { notify } from "@/lib/notify";
import { getUsuariosByNegocio, updateUsuarioNegocio } from "@/lib/services/usuarios-negocios";
import { getUsuarioByEmail, getUsuarioById, updateUsuario } from "@/lib/services/usuarios";
import { create } from "zustand";

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
            (isCurrentUser && authOverride?.displayName ? authOverride.displayName : null) ||
            u?.email?.split("@")[0] ||
            "Usuario";
          const email = u?.email ?? "";
          const rol: UserRole = u?.rol ?? "VENDEDOR";
          const inicial = (nombre[0] ?? "?").toUpperCase();
          const foto =
            u?.foto ??
            (isCurrentUser && authOverride?.photoURL ? authOverride.photoURL : undefined);
          return {
            relacion: rel,
            nombre,
            email,
            rol,
            foto,
            inicial,
          } satisfies MiembroConUsuario;
        })
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

  // NOTA(modelo): el rol se guarda en el doc global `usuarios`, no en la relación
  // `usuarios_negocios`. Contradice el modelo multi-tenant (un usuario podría
  // tener roles distintos por negocio). Migrar el rol a la relación requiere la
  // migración de Firestore pendiente (ver firestore.rules) — decisión abierta.
  updateRol: async (relId, userId, email, rol) => {
    try {
      await updateUsuario(userId, { rol }, email);
      // Solo mutar el estado local si la escritura remota tuvo éxito.
      set((state) => ({
        miembros: state.miembros.map((m) => (m.relacion.id === relId ? { ...m, rol } : m)),
      }));
    } catch {
      notify.error({ title: "No se pudo cambiar el rol" });
    }
  },

  removeMiembro: async (relId) => {
    try {
      await updateUsuarioNegocio(relId, { activo: false });
      set((state) => ({
        miembros: state.miembros.filter((m) => m.relacion.id !== relId),
      }));
    } catch {
      notify.error({ title: "No se pudo quitar al miembro" });
    }
  },

  addMiembro: (miembro) => {
    set((state) => ({
      miembros: [...state.miembros, miembro].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    }));
  },

  clear: () => set(initialState),
}));
