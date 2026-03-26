import { describe, it, expect } from "vitest";
import { createProductSchema } from "@/lib/validations/product-schema";

describe("createProductSchema", () => {
  describe("validaciones de nombre", () => {
    it("nombre vacío retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El nombre es requerido");
      }
    });

    it("nombre muy largo (>80 chars) retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "a".repeat(81),
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El nombre no puede exceder 80 caracteres");
      }
    });
  });

  describe("validaciones de categoria_id", () => {
    it("categoria_id vacío retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Debes seleccionar una categoría");
      }
    });
  });

  describe("validaciones de precio_venta", () => {
    it("precio_venta = 0 retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 0,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("El precio de venta debe ser mayor a 0");
      }
    });

    it("precio_venta negativo retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: -10,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validaciones de precio_mayoreo", () => {
    it("precio_mayoreo > precio_venta retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 150,
        costo_promedio: 50,
        cantidad: 10,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "El precio mayoreo debe ser menor o igual al precio de venta"
        );
      }
    });
  });

  describe("validaciones de costo_promedio", () => {
    it("costo_promedio negativo retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: -20,
        cantidad: 10,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validaciones de cantidad", () => {
    it("cantidad negativa retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: -5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("La cantidad no puede ser negativa");
      }
    });

    it("cantidad no entera retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 5.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("validaciones de imagen", () => {
    it("imagen vacía es válida (optional)", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        imagen: "",
      });
      expect(result.success).toBe(true);
    });

    it("imagen sin valor es válida (optional)", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
      });
      expect(result.success).toBe(true);
    });

    it("imagen con URL inválida retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        imagen: "not-a-valid-url",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Debe ser una URL válida");
      }
    });

    it("imagen con URL válida es aceptada", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        imagen: "https://example.com/image.jpg",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("validaciones de descripcion", () => {
    it("descripcion > 500 chars retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        descripcion: "a".repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "La descripción no puede exceder 500 caracteres"
        );
      }
    });

    it("descripcion dentro del límite es válida", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        descripcion: "a".repeat(500),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("validaciones de marca", () => {
    it("marca > 50 chars retorna error", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        marca: "a".repeat(51),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("La marca no puede exceder 50 caracteres");
      }
    });

    it("marca dentro del límite es válida", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        marca: "a".repeat(50),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("casos válidos", () => {
    it("todos los campos válidos pasa sin errores", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
        imagen: "https://example.com/image.jpg",
        descripcion: "Descripción del producto",
        marca: "Marca Test",
        stock_minimo: 5,
      });
      expect(result.success).toBe(true);
    });

    it("campos requeridos mínimos válidos", () => {
      const result = createProductSchema.safeParse({
        nombre: "Producto Test",
        categoria_id: "cat-1",
        precio_venta: 100,
        precio_mayoreo: 90,
        costo_promedio: 50,
        cantidad: 10,
      });
      expect(result.success).toBe(true);
    });
  });
});
