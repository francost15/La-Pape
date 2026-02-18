import { create } from 'zustand';

export interface DeleteConfirmItem {
  productId: string;
  nombre: string;
}

interface VentasUIStore {
  sheetVisible: boolean;
  deleteConfirmItem: DeleteConfirmItem | null;
  openSheet: () => void;
  closeSheet: () => void;
  setSheetVisible: (visible: boolean) => void;
  openDeleteConfirm: (item: DeleteConfirmItem) => void;
  closeDeleteConfirm: () => void;
}

export const useVentasUIStore = create<VentasUIStore>((set) => ({
  sheetVisible: false,
  deleteConfirmItem: null,

  openSheet: () => set({ sheetVisible: true }),
  closeSheet: () => set({ sheetVisible: false }),
  setSheetVisible: (visible) => set({ sheetVisible: visible }),

  openDeleteConfirm: (item) => set({ deleteConfirmItem: item }),
  closeDeleteConfirm: () => set({ deleteConfirmItem: null }),
}));
