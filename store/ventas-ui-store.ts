import type { VentasUIStore } from "@/interface/ventas";
import { create } from "zustand";

export const useVentasUIStore = create<VentasUIStore>((set) => ({
  sheetVisible: false,
  deleteConfirmItem: null,

  openSheet: () => set({ sheetVisible: true }),
  closeSheet: () => set({ sheetVisible: false }),
  setSheetVisible: (visible) => set({ sheetVisible: visible }),

  openDeleteConfirm: (item) => set({ deleteConfirmItem: item }),
  closeDeleteConfirm: () => set({ deleteConfirmItem: null }),
}));
