import type { VentasStore } from "@/interface/ventas";
import { notify } from "@/lib/notify";
import { create } from "zustand";

function avisarSinStock() {
  notify.warning({
    title: "Stock máximo alcanzado",
    description: "No hay más unidades disponibles de este producto",
  });
}

export const useVentasStore = create<VentasStore>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    const existing = get().items.find((i) => i.productId === product.id);
    const current = existing?.quantity ?? 0;
    // Tope al stock disponible: el vendedor no debe poder cargar más unidades de
    // las que existen. Se descubría el problema recién al confirmar la venta.
    if (current + quantity > product.cantidad) {
      avisarSinStock();
      if (current >= product.cantidad) return;
    }
    const nextQty = Math.min(current + quantity, product.cantidad);
    set((state) => {
      const newItems = existing
        ? state.items.map((i) => (i.productId === product.id ? { ...i, quantity: nextQty } : i))
        : [
            ...state.items,
            {
              productId: product.id,
              product,
              quantity: nextQty,
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
    const item = get().items.find((i) => i.productId === productId);
    if (item && quantity > item.product.cantidad) {
      avisarSinStock();
      quantity = item.product.cantidad;
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
