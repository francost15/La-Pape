import { describe, test, expect, beforeEach } from "vitest";

import { useVentasStore } from "@/store/ventas-store";
import type { Product } from "@/interface/products";

const mockProduct: Product = {
  id: "prod-1",
  negocio_id: "negocio-1",
  nombre: "Coca Cola 600ml",
  precio_venta: 100,
  precio_mayoreo: 80,
  costo_promedio: 50,
  cantidad: 10,
  categoria_id: "cat-1",
  imagen: "",
  descripcion: "",
  marca: "Coca-Cola",
  stock_minimo: 5,
  activo: true,
};

const mockProduct2: Product = {
  id: "prod-2",
  negocio_id: "negocio-1",
  nombre: "Pepsi 600ml",
  precio_venta: 90,
  precio_mayoreo: 70,
  costo_promedio: 40,
  cantidad: 10,
  categoria_id: "cat-1",
  imagen: "",
  descripcion: "",
  marca: "Pepsi",
  stock_minimo: 5,
  activo: true,
};

describe("Cart Flow", () => {
  beforeEach(() => {
    useVentasStore.getState().clearCart();
  });

  test("añadir producto - primera vez crea item con quantity 1", () => {
    const store = useVentasStore.getState();
    store.addItem(mockProduct);
    const state = useVentasStore.getState();

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
    expect(state.items[0].productId).toBe(mockProduct.id);
  });

  test("añadir mismo producto dos veces - incrementa quantity a 2", () => {
    const store = useVentasStore.getState();
    store.addItem(mockProduct);
    store.addItem(mockProduct);
    const state = useVentasStore.getState();

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  test("añadir tercer producto diferente - crea nuevo item", () => {
    const store = useVentasStore.getState();
    store.addItem(mockProduct);
    store.addItem(mockProduct2);
    const state = useVentasStore.getState();

    expect(state.items).toHaveLength(2);
  });

  test("getTotal calcula correctamente", () => {
    const store = useVentasStore.getState();
    store.addItem(mockProduct);
    store.addItem({ ...mockProduct2, precio_venta: 50 });

    expect(store.getTotal()).toBe(150);
  });

  test("getTotal con cantidades diferentes", () => {
    const store = useVentasStore.getState();
    store.addItem(mockProduct);
    store.addItem(mockProduct, 2);
    const state = useVentasStore.getState();

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
    expect(state.getTotal()).toBe(300);
  });

  test("updateQuantity modifica cantidad correctamente", () => {
    const store = useVentasStore.getState();
    store.addItem(mockProduct);
    store.updateQuantity(mockProduct.id, 5);
    const state = useVentasStore.getState();

    expect(state.items[0].quantity).toBe(5);
    expect(state.getTotal()).toBe(500);
  });

  test("updateQuantity a 0 remueve item", () => {
    const store = useVentasStore.getState();
    store.addItem(mockProduct);
    store.updateQuantity(mockProduct.id, 0);
    const state = useVentasStore.getState();

    expect(state.items).toHaveLength(0);
  });

  test("clearCart vacía todo", () => {
    const store = useVentasStore.getState();
    store.addItem(mockProduct);
    store.addItem(mockProduct2);
    store.clearCart();
    const state = useVentasStore.getState();

    expect(state.items).toHaveLength(0);
    expect(state.getTotal()).toBe(0);
  });
});
