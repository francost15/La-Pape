import { describe, it, expect, beforeEach, vi } from "vitest";
import { completeVentaFlow, CompleteVentaParams } from "@/lib/services/ventas/complete-venta";
import { refundVentaFlow } from "@/lib/services/ventas/refund-venta";
import { InvalidQuantityError, VentaError } from "@/lib/errors";
import type { Product } from "@/interface/products";

const mockRunTransaction = vi.fn();

vi.mock("@/lib/firebase", () => ({
  db: {},
  auth: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn().mockReturnValue({}),
  doc: vi.fn().mockReturnValue({}),
  runTransaction: (...args: unknown[]) => mockRunTransaction(...args),
  Timestamp: {
    now: vi.fn().mockReturnValue({ toDate: () => new Date() }),
    fromDate: vi.fn(),
  },
}));

vi.mock("@/lib/services/ventas-detalle", () => ({
  getDetallesByVenta: vi
    .fn()
    .mockResolvedValue([
      {
        id: "d1",
        venta_id: "v1",
        producto_id: "p1",
        cantidad: 2,
        precio_unitario: 50,
        total_linea: 100,
      },
    ]),
}));

function createMockProduct(id: string, nombre: string, cantidad: number): Product {
  return {
    id,
    nombre,
    precio_venta: 100,
    precio_mayoreo: 90,
    costo_promedio: 50,
    categoria_id: "cat-1",
    negocio_id: "negocio-1",
    cantidad,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("Ventas Service Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("completeVentaFlow", () => {
    it("should throw VentaError when cart is empty", async () => {
      const params: CompleteVentaParams = {
        items: [],
        negocioId: "negocio-1",
        sucursalId: "sucursal-1",
        userId: "user-1",
        total: 0,
        subtotal: 0,
      };

      await expect(completeVentaFlow(params)).rejects.toThrow(VentaError);
    });

    it("should throw InvalidQuantityError when item has zero quantity", async () => {
      const params: CompleteVentaParams = {
        items: [
          {
            productId: "prod-1",
            product: createMockProduct("prod-1", "Test Product", 10),
            quantity: 0,
            unitPrice: 100,
          },
        ],
        negocioId: "negocio-1",
        sucursalId: "sucursal-1",
        userId: "user-1",
        total: 0,
        subtotal: 0,
      };

      await expect(completeVentaFlow(params)).rejects.toThrow(InvalidQuantityError);
    });

    it("should throw InvalidQuantityError when item has negative quantity", async () => {
      const params: CompleteVentaParams = {
        items: [
          {
            productId: "prod-1",
            product: createMockProduct("prod-1", "Test Product", 10),
            quantity: -5,
            unitPrice: 100,
          },
        ],
        negocioId: "negocio-1",
        sucursalId: "sucursal-1",
        userId: "user-1",
        total: 0,
        subtotal: 0,
      };

      await expect(completeVentaFlow(params)).rejects.toThrow(InvalidQuantityError);
    });

    it("should aggregate quantities for same product", async () => {
      const items = [
        {
          productId: "prod-1",
          product: createMockProduct("prod-1", "Test Product", 10),
          quantity: 2,
          unitPrice: 100,
        },
        {
          productId: "prod-1",
          product: createMockProduct("prod-1", "Test Product", 10),
          quantity: 3,
          unitPrice: 100,
        },
      ];

      mockRunTransaction.mockImplementation(async (db, callback) => {
        const mockGet = vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ cantidad: 10 }),
        });

        const transaction = {
          get: mockGet,
          set: vi.fn(),
          update: vi.fn(),
        };

        await callback(transaction);
        return "venta-id-123";
      });

      const params: CompleteVentaParams = {
        items,
        negocioId: "negocio-1",
        sucursalId: "sucursal-1",
        userId: "user-1",
        total: 500,
        subtotal: 500,
      };

      const result = await completeVentaFlow(params);
      expect(result.ventaId).toBe("venta-id-123");
    });
  });

  describe("refundVentaFlow", () => {
    it("should throw error when venta does not exist", async () => {
      mockRunTransaction.mockImplementation(async (db, callback) => {
        const mockGet = vi.fn().mockResolvedValue({
          exists: () => false,
        });

        const transaction = {
          get: mockGet,
          update: vi.fn(),
        };

        await callback(transaction);
      });

      await expect(
        refundVentaFlow({
          ventaId: "non-existent",
          sucursalId: "sucursal-1",
          userId: "user-1",
        })
      ).rejects.toThrow("La venta no existe");
    });

    it("should throw error when venta is already refunded", async () => {
      mockRunTransaction.mockImplementation(async (db, callback) => {
        const mockGet = vi.fn().mockResolvedValue({
          exists: () => true,
          data: () => ({ estado: "REEMBOLSO" }),
        });

        const transaction = {
          get: mockGet,
          update: vi.fn(),
        };

        await callback(transaction);
      });

      await expect(
        refundVentaFlow({
          ventaId: "already-refunded",
          sucursalId: "sucursal-1",
          userId: "user-1",
        })
      ).rejects.toThrow("La venta ya fue reembolsada");
    });
  });
});
