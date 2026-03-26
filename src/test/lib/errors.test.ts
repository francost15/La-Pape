import { describe, it, expect } from "vitest";
import {
  AppError,
  InsufficientStockError,
  ProductNotFoundError,
  InvalidQuantityError,
  VentaError,
  NotFoundError,
} from "@/lib/errors";

describe("AppError", () => {
  it("should create error with message and code", () => {
    const error = new AppError("Test error", "TEST_CODE");
    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_CODE");
    expect(error.name).toBe("AppError");
  });

  it("should be instance of Error", () => {
    const error = new AppError("Test", "CODE");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});

describe("InsufficientStockError", () => {
  it("should create error with stock message", () => {
    const error = new InsufficientStockError("Product A", 5);
    expect(error.message).toContain("Product A");
    expect(error.message).toContain("5");
    expect(error.code).toBe("INSUFFICIENT_STOCK");
  });
});

describe("ProductNotFoundError", () => {
  it("should create error with product id", () => {
    const error = new ProductNotFoundError("prod-123");
    expect(error.message).toContain("prod-123");
    expect(error.code).toBe("PRODUCT_NOT_FOUND");
  });
});

describe("InvalidQuantityError", () => {
  it("should create error with product name", () => {
    const error = new InvalidQuantityError("Widget");
    expect(error.message).toContain("Widget");
    expect(error.code).toBe("INVALID_QUANTITY");
  });
});

describe("VentaError", () => {
  it("should create error with custom message", () => {
    const error = new VentaError("Venta failed");
    expect(error.message).toBe("Venta failed");
    expect(error.code).toBe("VENTA_ERROR");
  });
});

describe("NotFoundError", () => {
  it("should create error with resource name", () => {
    const error = new NotFoundError("Usuario");
    expect(error.message).toContain("Usuario");
    expect(error.code).toBe("NOT_FOUND");
  });
});
