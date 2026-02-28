import type { Venta } from "@/interface";
import { auth } from "@/lib/firebase";
import { getUsuarioByEmail, getUsuarioById } from "@/lib/services/usuarios";
import { getUsuariosByNegocio } from "@/lib/services/usuarios-negocios";
import { useSessionStore } from "@/store/session-store";
import { useCallback, useEffect, useState } from "react";

export interface UsuarioInfo {
  nombre: string;
  email?: string;
  foto?: string;
}

export type UsuariosMap = Record<string, UsuarioInfo>;

/**
 * Resuelve y cachea los datos de display (nombre, foto) de los usuarios
 * que participan en ventas de un negocio.
 *
 * Maneja dos casos:
 * 1. Carga inicial: obtiene todos los usuarios del negocio con getUsuariosByNegocio.
 * 2. Llenado incremental: si algún usuario_id de ventasFiltradas no está en el mapa,
 *    lo busca individualmente. Esto cubre casos donde un usuario fue desvinculado
 *    del negocio pero tiene ventas históricas.
 *
 * El usuario activo recibe tratamiento especial:
 * - Se prioriza displayName del auth provider (Google, etc.)
 * - Se usa photoURL del auth si el doc de Firestore no tiene foto.
 */
export function useUsuariosMap(
  negocioId: string | null,
  ventasFiltradas: Venta[],
): UsuariosMap {
  const userId = useSessionStore((s) => s.userId);
  const userEmail = useSessionStore((s) => s.userEmail);
  // Prioriza el displayName del auth sobre el guardado en Firestore
  const displayName =
    useSessionStore((s) => s.displayName) ?? auth.currentUser?.displayName ?? null;
  const photoURL =
    useSessionStore((s) => s.photoURL) ?? auth.currentUser?.photoURL ?? null;

  const [usuariosMap, setUsuariosMap] = useState<UsuariosMap>({});

  /**
   * Resuelve un uid → UsuarioInfo, priorizando datos del usuario activo.
   * Memoizado para no cambiar referencia en cada render.
   */
  const resolveUsuario = useCallback(
    async (uid: string): Promise<[string, UsuarioInfo]> => {
      const isCurrentUser = Boolean(userId && userEmail && uid === userId);

      // Para el usuario activo intentamos primero por email (más actualizado)
      const usuario = isCurrentUser
        ? ((await getUsuarioByEmail(userEmail!)) ?? (await getUsuarioById(uid)))
        : await getUsuarioById(uid);

      const data = usuario as (typeof usuario) & { foto?: string };

      const nombre =
        (isCurrentUser && displayName?.trim() ? displayName : null) ??
        usuario?.nombre?.trim() ??
        usuario?.email?.split("@")[0] ??
        (isCurrentUser ? "Tú" : "Vendedor");

      return [
        uid,
        {
          nombre,
          email: usuario?.email,
          foto: data?.foto ?? (isCurrentUser && photoURL ? photoURL : undefined),
        },
      ];
    },
    [userId, userEmail, displayName, photoURL],
  );

  // ── Carga inicial: todos los usuarios del negocio ──────────────────────
  useEffect(() => {
    if (!negocioId) return;
    let cancelled = false;

    getUsuariosByNegocio(negocioId)
      .then((usuarioNegocios) =>
        Promise.all(usuarioNegocios.map((u) => resolveUsuario(u.usuario_id))),
      )
      .then((entries) => {
        if (!cancelled) setUsuariosMap(Object.fromEntries(entries));
      })
      .catch(() => {
        if (!cancelled) setUsuariosMap({});
      });

    return () => {
      cancelled = true;
    };
  }, [negocioId, resolveUsuario]);

  // ── Llenado incremental: busca usuarios faltantes en ventas filtradas ──
  useEffect(() => {
    const missingIds = [
      ...new Set(ventasFiltradas.map((v) => v.usuario_id)),
    ].filter((id) => !usuariosMap[id]);

    if (missingIds.length === 0) return;

    let cancelled = false;

    Promise.all(missingIds.map(resolveUsuario)).then((entries) => {
      if (!cancelled) {
        setUsuariosMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ventasFiltradas, usuariosMap, resolveUsuario]);

  return usuariosMap;
}
