import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCheckoutStore } from "@/store/checkout-store";

vi.mock("@/lib/firebase", () => ({ db: {}, auth: {} }));
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({ id: "pending-venta" })),
  runTransaction: vi.fn(),
  Timestamp: { now: vi.fn(), fromDate: vi.fn() },
}));

describe("CheckoutStore", () => {
  beforeEach(() => {
    useCheckoutStore.setState({
      confirmVisible: false,
      processing: false,
      pendingVentaId: null,
    });
  });

  it("should have initial state", () => {
    expect(useCheckoutStore.getState().confirmVisible).toBe(false);
    expect(useCheckoutStore.getState().processing).toBe(false);
    expect(useCheckoutStore.getState().successVenta).toBe(null);
  });

  it("reutiliza el id de venta mientras el intento no termina", () => {
    useCheckoutStore.getState().openConfirm();
    const first = useCheckoutStore.getState().pendingVentaId;
    useCheckoutStore.getState().closeConfirm();
    useCheckoutStore.getState().openConfirm();
    expect(useCheckoutStore.getState().pendingVentaId).toBe(first);
    expect(first).toBe("pending-venta");
  });

  it("should close confirm modal", () => {
    useCheckoutStore.getState().openConfirm();
    useCheckoutStore.getState().closeConfirm();
    expect(useCheckoutStore.getState().confirmVisible).toBe(false);
  });

  it("should set processing state", () => {
    useCheckoutStore.getState().setProcessing(true);
    expect(useCheckoutStore.getState().processing).toBe(true);
  });

  it("should set processing to false", () => {
    useCheckoutStore.getState().setProcessing(true);
    useCheckoutStore.getState().setProcessing(false);
    expect(useCheckoutStore.getState().processing).toBe(false);
  });

  it("should set success venta data", () => {
    const ventaData = {
      id: "123",
      fecha: "2024-01-01",
      total: 1000,
      subtotal: 900,
      descuento: 100,
      metodoPago: "Efectivo",
      items: [
        {
          nombre: "Product 1",
          cantidad: 2,
          precioUnitario: 500,
          totalLinea: 1000,
        },
      ],
    };
    useCheckoutStore.getState().setSuccessVenta(ventaData);
    expect(useCheckoutStore.getState().successVenta).toEqual(ventaData);
  });

  it("should reset confirmVisible and processing when setting success venta", () => {
    useCheckoutStore.getState().openConfirm();
    useCheckoutStore.getState().setProcessing(true);

    useCheckoutStore.getState().setSuccessVenta({
      id: "123",
      fecha: "2024-01-01",
      total: 1000,
      subtotal: 900,
      descuento: 100,
      metodoPago: "Efectivo",
      items: [],
    });

    expect(useCheckoutStore.getState().confirmVisible).toBe(false);
    expect(useCheckoutStore.getState().processing).toBe(false);
  });

  it("should close success modal", () => {
    useCheckoutStore.getState().setSuccessVenta({
      id: "123",
      fecha: "2024-01-01",
      total: 1000,
      subtotal: 900,
      descuento: 100,
      metodoPago: "Efectivo",
      items: [],
    });
    useCheckoutStore.getState().closeSuccess();
    expect(useCheckoutStore.getState().successVenta).toBe(null);
  });
});
