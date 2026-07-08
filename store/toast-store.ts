import type { ToastStore } from "@/interface/toast";
import { create } from "zustand";

let counter = 0;
const MAX_TOASTS = 5;
const TOAST_DURATION_MS = 3000;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  push: (type, title, description) => {
    const id = `toast-${++counter}-${Date.now()}`;
    set((s) => {
      const next = [...s.toasts, { id, type, title, description }];
      const trimmed = next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
      return { toasts: trimmed };
    });
    setTimeout(() => get().dismiss(id), TOAST_DURATION_MS);
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}));
