import { describe, it, expect, beforeEach } from "vitest";

import { useVentasStore } from "@/store/ventas-store";
import type { Product } from "@/interface/products";

const mockProduct: Product = {
  id: "prod-1",
  negocio_id: "negocio-1",
  nombre: "Test Product",
  precio_venta: 100,
  precio_mayoreo: 80,
  costo_promedio: 50,
  cantidad: 10,
  categoria_id: "cat-1",
  imagen: "",
  descripcion: "",
  marca: "Test",
  stock_minimo: 5,
  activo: true,
};

const mockProduct2: Product = {
  id: "prod-2",
  negocio_id: "negocio-1",
  nombre: "Second Product",
  precio_venta: 250,
  precio_mayoreo: 200,
  costo_promedio: 150,
  cantidad: 5,
  categoria_id: "cat-1",
  imagen: "",
  descripcion: "",
  marca: "Brand",
  stock_minimo: 3,
  activo: true,
};

const getStore = () => useVentasStore.getState();

describe("ventas-store", () => {
  beforeEach(() => {
    useVentasStore.getState().clearCart();
  });

  describe("addItem", () => {
    it("agregar producto nuevo al carrito", () => {
      const store = getStore();
      store.addItem(mockProduct);
      const state = getStore();

      expect(state.items).toHaveLength(1);
      expect(state.items[0].productId).toBe("prod-1");
      expect(state.items[0].product).toEqual(mockProduct);
      expect(state.items[0].quantity).toBe(1);
      expect(state.items[0].unitPrice).toBe(100);
    });

    it("agregar mismo producto dos veces (debe incrementar quantity)", () => {
      const store = getStore();
      store.addItem(mockProduct);
      store.addItem(mockProduct);
      const state = getStore();

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(2);
    });

    it("producto con quantity default de 1", () => {
      const store = getStore();
      store.addItem(mockProduct, 1);
      const state = getStore();

      expect(state.items[0].quantity).toBe(1);
    });

    it("producto con quantity personalizada", () => {
      const store = getStore();
      store.addItem(mockProduct, 5);
      const state = getStore();

      expect(state.items[0].quantity).toBe(5);
    });
  });

  describe("removeItem", () => {
    it("remover producto existente", () => {
      const store = getStore();
      store.addItem(mockProduct);
      expect(getStore().items).toHaveLength(1);

      store.removeItem("prod-1");
      const state = getStore();

      expect(state.items).toHaveLength(0);
    });

    it("remover producto que no existe (no debe throw)", () => {
      const store = getStore();
      store.addItem(mockProduct);

      expect(() => store.removeItem("non-existent-id")).not.toThrow();
      expect(getStore().items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("actualizar quantity a valor mayor", () => {
      const store = getStore();
      store.addItem(mockProduct);
      store.updateQuantity("prod-1", 10);
      const state = getStore();

      expect(state.items[0].quantity).toBe(10);
    });

    it("actualizar quantity a 0 (debe remover el item)", () => {
      const store = getStore();
      store.addItem(mockProduct);
      store.updateQuantity("prod-1", 0);
      const state = getStore();

      expect(state.items).toHaveLength(0);
    });

    it("actualizar quantity a negativo (debe remover el item)", () => {
      const store = getStore();
      store.addItem(mockProduct);
      store.updateQuantity("prod-1", -5);
      const state = getStore();

      expect(state.items).toHaveLength(0);
    });

    it("actualizar quantity de producto no existente (no debe throw)", () => {
      const store = getStore();

      expect(() => store.updateQuantity("non-existent", 5)).not.toThrow();
    });
  });

  describe("clearCart", () => {
    it("vaciar carrito con items", () => {
      const store = getStore();
      store.addItem(mockProduct);
      store.addItem(mockProduct2);
      expect(getStore().items).toHaveLength(2);

      store.clearCart();
      const state = getStore();

      expect(state.items).toHaveLength(0);
    });

    it("vaciar carrito vacío (no debe throw)", () => {
      const store = getStore();

      expect(() => store.clearCart()).not.toThrow();
    });
  });

  describe("getTotal", () => {
    it("carrito vacío = 0", () => {
      const store = getStore();
      expect(store.getTotal()).toBe(0);
    });

    it("un producto = precio * quantity", () => {
      const store = getStore();
      store.addItem(mockProduct, 3);

      expect(store.getTotal()).toBe(300);
    });

    it("múltiples productos = suma correcta", () => {
      const store = getStore();
      store.addItem(mockProduct, 2);
      store.addItem(mockProduct2, 3);

      expect(store.getTotal()).toBe(200 + 750);
    });

    it("decimales correctos", () => {
      const store = getStore();
      const productWithDecimals: Product = {
        ...mockProduct,
        id: "prod-decimal",
        precio_venta: 99.99,
      };
      store.addItem(productWithDecimals, 3);

      expect(store.getTotal()).toBeCloseTo(299.97);
    });
  });

  describe("getItemCount", () => {
    it("carrito vacío = 0", () => {
      const store = getStore();
      expect(store.getItemCount()).toBe(0);
    });

    it("un producto = su quantity", () => {
      const store = getStore();
      store.addItem(mockProduct, 5);

      expect(store.getItemCount()).toBe(5);
    });

    it("múltiples productos = suma de quantities", () => {
      const store = getStore();
      store.addItem(mockProduct, 2);
      store.addItem(mockProduct2, 3);

      expect(store.getItemCount()).toBe(5);
    });
  });
});
