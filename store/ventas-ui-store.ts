import type { VentasUIStore } from "@/interface/ventas";
import { create } from "zustand";

export const useVentasUIStore = create<VentasUIStore>((set) => ({
  sheetVisible: false,
  deleteConfirmItem: null,
  qrScannerVisible: false,
  clearCartConfirmVisible: false,
  isClearing: false,

  openSheet: () => set({ sheetVisible: true }),
  closeSheet: () => set({ sheetVisible: false }),
  setSheetVisible: (visible) => set({ sheetVisible: visible }),

  openDeleteConfirm: (item) => set({ deleteConfirmItem: item }),
  closeDeleteConfirm: () => set({ deleteConfirmItem: null }),

  openQrScanner: () => set({ qrScannerVisible: true }),
  closeQrScanner: () => set({ qrScannerVisible: false }),

  openClearCartConfirm: () => set({ clearCartConfirmVisible: true }),
  closeClearCartConfirm: () => set({ clearCartConfirmVisible: false }),
  setIsClearing: (value) => set({ isClearing: value }),
}));
