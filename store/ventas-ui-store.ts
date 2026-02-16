import { create } from 'zustand';

const TOAST_DURATION_MS = 2000;

interface VentasUIStore {
  sheetVisible: boolean;
  toastMessage: string | null;
  openSheet: () => void;
  closeSheet: () => void;
  setSheetVisible: (visible: boolean) => void;
  showToast: (text: string) => void;
  clearToast: () => void;
}

let toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useVentasUIStore = create<VentasUIStore>((set, get) => ({
  sheetVisible: false,
  toastMessage: null,

  openSheet: () => set({ sheetVisible: true }),
  closeSheet: () => set({ sheetVisible: false }),
  setSheetVisible: (visible) => set({ sheetVisible: visible }),

  showToast: (text) => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    set({ toastMessage: text });
    toastTimeoutId = setTimeout(() => {
      get().clearToast();
      toastTimeoutId = null;
    }, TOAST_DURATION_MS);
  },

  clearToast: () => set({ toastMessage: null }),
}));
