import { describe, it, expect, beforeEach } from "vitest";
import { useCheckoutStore } from "@/store/checkout-store";

describe("CheckoutStore", () => {
  beforeEach(() => {
    useCheckoutStore.setState({
      confirmVisible: false,
      processing: false,
      successVenta: null,
    });
  });

  it("should have initial state", () => {
    expect(useCheckoutStore.getState().confirmVisible).toBe(false);
    expect(useCheckoutStore.getState().processing).toBe(false);
    expect(useCheckoutStore.getState().successVenta).toBe(null);
  });

  it("should open confirm modal", () => {
    useCheckoutStore.getState().openConfirm();
    expect(useCheckoutStore.getState().confirmVisible).toBe(true);
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
      items: [],
    });
    useCheckoutStore.getState().closeSuccess();
    expect(useCheckoutStore.getState().successVenta).toBe(null);
  });
});
