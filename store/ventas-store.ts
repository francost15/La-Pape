import type { VentasStore } from "@/interface/ventas";
import { create } from "zustand";

export const useVentasStore = create<VentasStore>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      const newItems = existing
        ? state.items.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [
            ...state.items,
            {
              productId: product.id,
              product,
              quantity,
              unitPrice: product.precio_venta,
            },
          ];
      return { items: newItems };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
