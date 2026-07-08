import { auth } from "@/lib/firebase";
import { notify } from "@/lib/notify";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useCallback } from "react";

/** Cierre de sesión centralizado; session-store se limpia vía initSessionListener. */
export function useSignOut() {
  return useCallback(async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch {
      notify.error({ title: "Error al cerrar sesión" });
    }
  }, []);
}
