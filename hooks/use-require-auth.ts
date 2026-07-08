import { useSessionStore } from "@/store/session-store";
import { useRouter } from "expo-router";
import { useEffect } from "react";

interface UseRequireAuthOptions {
  /** Redirige aquí si no hay sesión (p. ej. pantallas protegidas). */
  redirectUnauthenticatedTo?: string;
  /** Redirige aquí si ya hay sesión (p. ej. pantalla de login). */
  redirectAuthenticatedTo?: string;
}

/**
 * Guard de navegación basado en session-store (sin listeners duplicados de Firebase).
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const router = useRouter();
  const ready = useSessionStore((s) => s.ready);
  const userId = useSessionStore((s) => s.userId);

  useEffect(() => {
    if (!ready) return;

    if (!userId && options.redirectUnauthenticatedTo) {
      router.replace(options.redirectUnauthenticatedTo as never);
      return;
    }

    if (userId && options.redirectAuthenticatedTo) {
      router.replace(options.redirectAuthenticatedTo as never);
    }
  }, [ready, userId, options.redirectUnauthenticatedTo, options.redirectAuthenticatedTo, router]);

  return {
    ready,
    userId,
    isAuthenticated: Boolean(userId),
  };
}
