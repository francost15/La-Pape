import type { ToastStore } from "@/interface/toast";
import { create } from "zustand";

let counter = 0;
const MAX_TOASTS = 5;
const TOAST_DURATION_MS = 3000;

// Timers de auto-dismiss por id: se limpian al descartar/limpiar para no dejar
// callbacks pendientes (que además re-disparaban un dismiss ya resuelto).
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function clearTimer(id: string) {
  const t = timers.get(id);
  if (t) {
    clearTimeout(t);
    timers.delete(id);
  }
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  push: (type, title, description) => {
    const id = `toast-${++counter}-${Date.now()}`;
    set((s) => {
      const next = [...s.toasts, { id, type, title, description }];
      // Si recortamos toasts viejos, limpiar también sus timers.
      const overflow = next.length - MAX_TOASTS;
      const trimmed = overflow > 0 ? next.slice(overflow) : next;
      if (overflow > 0) next.slice(0, overflow).forEach((t) => clearTimer(t.id));
      return { toasts: trimmed };
    });
    timers.set(
      id,
      setTimeout(() => get().dismiss(id), TOAST_DURATION_MS)
    );
  },

  dismiss: (id) => {
    clearTimer(id);
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  clear: () => {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    set({ toasts: [] });
  },
}));
