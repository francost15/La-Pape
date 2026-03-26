import { describe, it, expect, beforeEach } from "vitest";
import { useProductosStore } from "@/store/productos-store";

describe("ProductosStore", () => {
  beforeEach(() => {
    useProductosStore.setState({
      negocioId: null,
      categories: [],
      products: [],
      currentProduct: null,
      productLoading: false,
      productImageError: false,
      loading: false,
      error: null,
    });
  });

  it("should have initial state", () => {
    expect(useProductosStore.getState().negocioId).toBe(null);
    expect(useProductosStore.getState().categories).toEqual([]);
    expect(useProductosStore.getState().products).toEqual([]);
    expect(useProductosStore.getState().currentProduct).toBe(null);
    expect(useProductosStore.getState().productLoading).toBe(false);
    expect(useProductosStore.getState().productImageError).toBe(false);
    expect(useProductosStore.getState().loading).toBe(false);
    expect(useProductosStore.getState().error).toBe(null);
  });

  it("should set negocioId", () => {
    useProductosStore.getState().setNegocioId("negocio-123");
    expect(useProductosStore.getState().negocioId).toBe("negocio-123");
  });

  it("should set categories", () => {
    const categories = [
      { id: "cat-1", nombre: "Category 1", negocio_id: "n1", activo: true },
      { id: "cat-2", nombre: "Category 2", negocio_id: "n1", activo: true },
    ];
    useProductosStore.getState().setCategories(categories);
    expect(useProductosStore.getState().categories).toEqual(categories);
  });

  it("should set products", () => {
    const products = [
      {
        id: "prod-1",
        nombre: "Product 1",
        precio_venta: 1000,
        precio_mayoreo: 900,
        costo_promedio: 500,
        cantidad: 10,
        categoria_id: "cat-1",
        negocio_id: "n1",
        activo: true,
      },
    ];
    useProductosStore.getState().setProducts(products);
    expect(useProductosStore.getState().products).toEqual(products);
  });

  it("should set loading state", () => {
    useProductosStore.getState().setLoading(true);
    expect(useProductosStore.getState().loading).toBe(true);
  });

  it("should set error state", () => {
    useProductosStore.getState().setError("Failed to load products");
    expect(useProductosStore.getState().error).toBe("Failed to load products");
  });

  it("should set currentProduct", () => {
    const product = {
      id: "prod-1",
      nombre: "Product 1",
      precio_venta: 1000,
      precio_mayoreo: 900,
      costo_promedio: 500,
      cantidad: 10,
      categoria_id: "cat-1",
      negocio_id: "n1",
      activo: true,
    };
    useProductosStore.getState().setCurrentProduct(product);
    expect(useProductosStore.getState().currentProduct).toEqual(product);
  });

  it("should set productLoading", () => {
    useProductosStore.getState().setProductLoading(true);
    expect(useProductosStore.getState().productLoading).toBe(true);
  });

  it("should set productImageError", () => {
    useProductosStore.getState().setProductImageError(true);
    expect(useProductosStore.getState().productImageError).toBe(true);
  });

  it("should reset to initial state", () => {
    const store = useProductosStore.getState();
    store.setNegocioId("negocio-123");
    store.setCategories([{ id: "cat-1", nombre: "Cat", negocio_id: "n1", activo: true }]);
    store.setProducts([
      {
        id: "p1",
        nombre: "P",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        categoria_id: "cat-1",
        negocio_id: "n1",
        activo: true,
      },
    ]);
    store.setLoading(true);
    store.setError("error");

    useProductosStore.getState().reset();

    expect(useProductosStore.getState().negocioId).toBe(null);
    expect(useProductosStore.getState().categories).toEqual([]);
    expect(useProductosStore.getState().products).toEqual([]);
    expect(useProductosStore.getState().loading).toBe(false);
    expect(useProductosStore.getState().error).toBe(null);
  });

  it("should resetCurrentProduct only", () => {
    const product = {
      id: "prod-1",
      nombre: "Product 1",
      precio_venta: 1000,
      precio_mayoreo: 900,
      costo_promedio: 500,
      cantidad: 10,
      categoria_id: "cat-1",
      negocio_id: "n1",
      activo: true,
    };

    useProductosStore.getState().setCurrentProduct(product);
    useProductosStore.getState().setProductLoading(true);
    useProductosStore.getState().setProductImageError(true);
    useProductosStore.getState().resetCurrentProduct();

    expect(useProductosStore.getState().currentProduct).toBe(null);
    expect(useProductosStore.getState().productLoading).toBe(false);
    expect(useProductosStore.getState().productImageError).toBe(false);
  });
});
