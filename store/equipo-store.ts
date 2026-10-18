import type { UserRole } from "@/interface";
import type { AuthUserOverride, EquipoStore, MiembroConUsuario } from "@/interface/equipo";
import { notify } from "@/lib/notify";
import { appendAudit } from "@/lib/services/auditoria";
import { getUsuariosByNegocio, updateUsuarioNegocio } from "@/lib/services/usuarios-negocios";
import { getUsuarioByEmail, getUsuarioById } from "@/lib/services/usuarios";
import { useSessionStore } from "@/store/session-store";
import { writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
          const rol: UserRole = rel.rol ?? "VENDEDOR";
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

  updateRol: async (relId, userId, _email, rol) => {
    const miembro = get().miembros.find((m) => m.relacion.id === relId);
    const negocioId = miembro?.relacion.negocio_id;
    const actorId = useSessionStore.getState().userId ?? userId;
    try {
      if (negocioId) {
        const batch = writeBatch(db);
        batch.update(doc(db, "usuarios_negocios", relId), { rol });
        appendAudit(batch, {
          negocio_id: negocioId,
          usuario_id: actorId,
          accion: "cambiar_rol",
          entidad: "usuarios_negocios",
          entidad_id: relId,
          diff: { rol },
        });
        await batch.commit();
      } else {
        await updateUsuarioNegocio(relId, { rol });
      }
      set((state) => ({
        miembros: state.miembros.map((m) => (m.relacion.id === relId ? { ...m, rol } : m)),
      }));
    } catch {
      notify.error({ title: "No se pudo cambiar el rol" });
    }
  },

  removeMiembro: async (relId) => {
    const miembro = get().miembros.find((m) => m.relacion.id === relId);
    const actorId = useSessionStore.getState().userId ?? miembro?.relacion.usuario_id ?? "";
    try {
      if (miembro) {
        const batch = writeBatch(db);
        batch.update(doc(db, "usuarios_negocios", relId), { activo: false });
        appendAudit(batch, {
          negocio_id: miembro.relacion.negocio_id,
          usuario_id: actorId,
          accion: "quitar_miembro",
          entidad: "usuarios_negocios",
          entidad_id: relId,
        });
        await batch.commit();
      } else {
        await updateUsuarioNegocio(relId, { activo: false });
      }
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
