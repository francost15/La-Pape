import { describe, it, expect, beforeEach } from "vitest";
import { useProductSearchStore } from "@/store/product-search-store";

describe("ProductSearchStore", () => {
  beforeEach(() => {
    useProductSearchStore.setState({
      contexts: {
        productos: { searchText: "", selectedCategoryId: null },
        ventas: { searchText: "", selectedCategoryId: null },
      },
    });
  });

  it("should have initial state", () => {
    expect(useProductSearchStore.getState().contexts.productos.searchText).toBe("");
    expect(useProductSearchStore.getState().contexts.productos.selectedCategoryId).toBe(null);
    expect(useProductSearchStore.getState().contexts.ventas.searchText).toBe("");
    expect(useProductSearchStore.getState().contexts.ventas.selectedCategoryId).toBe(null);
  });

  it("should set searchText for productos context", () => {
    useProductSearchStore.getState().setSearchText("productos", "test query");
    expect(useProductSearchStore.getState().contexts.productos.searchText).toBe("test query");
  });

  it("should set searchText for ventas context", () => {
    useProductSearchStore.getState().setSearchText("ventas", "venta query");
    expect(useProductSearchStore.getState().contexts.ventas.searchText).toBe("venta query");
  });

  it("should set selectedCategoryId for productos context", () => {
    useProductSearchStore.getState().setSelectedCategoryId("productos", "cat-123");
    expect(useProductSearchStore.getState().contexts.productos.selectedCategoryId).toBe("cat-123");
  });

  it("should set selectedCategoryId for ventas context", () => {
    useProductSearchStore.getState().setSelectedCategoryId("ventas", "cat-456");
    expect(useProductSearchStore.getState().contexts.ventas.selectedCategoryId).toBe("cat-456");
  });

  it("should set selectedCategoryId to null", () => {
    useProductSearchStore.getState().setSelectedCategoryId("productos", "cat-123");
    useProductSearchStore.getState().setSelectedCategoryId("productos", null);
    expect(useProductSearchStore.getState().contexts.productos.selectedCategoryId).toBe(null);
  });

  it("should get search state for context", () => {
    useProductSearchStore.getState().setSearchText("productos", "test");
    useProductSearchStore.getState().setSelectedCategoryId("productos", "cat-1");

    const state = useProductSearchStore.getState().getSearchState("productos");
    expect(state.searchText).toBe("test");
    expect(state.selectedCategoryId).toBe("cat-1");
  });

  it("should reset context to default state", () => {
    useProductSearchStore.getState().setSearchText("productos", "test");
    useProductSearchStore.getState().setSelectedCategoryId("productos", "cat-1");

    useProductSearchStore.getState().resetContext("productos");

    expect(useProductSearchStore.getState().contexts.productos.searchText).toBe("");
    expect(useProductSearchStore.getState().contexts.productos.selectedCategoryId).toBe(null);
  });

  it("should not affect other context when resetting one", () => {
    useProductSearchStore.getState().setSearchText("productos", "test");
    useProductSearchStore.getState().setSearchText("ventas", "venta test");

    useProductSearchStore.getState().resetContext("productos");

    expect(useProductSearchStore.getState().contexts.productos.searchText).toBe("");
    expect(useProductSearchStore.getState().contexts.ventas.searchText).toBe("venta test");
  });
});
