import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import type { CreateProductInput } from "@/interface/products";

const mockAddDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockUpdateDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockDeleteField = vi.fn(() => "DELETE_FIELD");

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({ withConverter: (converter: unknown) => ({ converter }) })),
  doc: vi.fn((_db: unknown, _col: string, id?: string) => ({
    id: id ?? "prod-1",
    withConverter: (converter: unknown) => ({ id: id ?? "prod-1", converter }),
  })),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  deleteField: () => mockDeleteField(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  Timestamp: {
    now: () => ({ seconds: 1 }),
    fromDate: (date: Date) => date,
  },
}));

import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/lib/services/productos";

const input: CreateProductInput = {
  negocio_id: "neg-1",
  nombre: "Harina",
  categoria_id: "cat-1",
  precio_venta: 1200,
  precio_mayoreo: 1000,
  costo_promedio: 800,
  cantidad: 4,
};

describe("servicio de productos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea un producto y devuelve el id", async () => {
    mockAddDoc.mockResolvedValue({ id: "prod-9" });
    await expect(createProduct(input)).resolves.toBe("prod-9");
    expect(mockAddDoc).toHaveBeenCalledOnce();
  });

  it("envuelve el fallo de creación en AppError", async () => {
    mockAddDoc.mockRejectedValue(new Error("red"));
    await expect(createProduct(input)).rejects.toMatchObject({
      name: "AppError",
      code: "CREATE_PRODUCT_ERROR",
    });
    await expect(createProduct(input)).rejects.toBeInstanceOf(AppError);
  });

  it("devuelve el producto cuando existe", async () => {
    const product = { id: "prod-1", nombre: "Harina" };
    mockGetDoc.mockResolvedValue({ exists: () => true, data: () => product });
    await expect(getProductById("prod-1")).resolves.toEqual(product);
  });

  it("devuelve null si el producto no existe", async () => {
    mockGetDoc.mockResolvedValue({ exists: () => false });
    await expect(getProductById("missing")).resolves.toBeNull();
  });

  it("envuelve el fallo de lectura en AppError", async () => {
    mockGetDoc.mockRejectedValue(new Error("red"));
    await expect(getProductById("prod-1")).rejects.toMatchObject({ code: "GET_PRODUCT_ERROR" });
  });

  it("borra campos vacíos al actualizar y elimina el documento", async () => {
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);

    await updateProduct("prod-1", { marca: "", nombre: "Harina integral" });
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ id: "prod-1" }),
      expect.objectContaining({ nombre: "Harina integral", marca: "DELETE_FIELD" })
    );

    await deleteProduct("prod-1");
    expect(mockDeleteDoc).toHaveBeenCalledOnce();
  });

  it("envuelve fallos de actualización y borrado en AppError", async () => {
    mockUpdateDoc.mockRejectedValue(new Error("red"));
    mockDeleteDoc.mockRejectedValue(new Error("red"));
    await expect(updateProduct("prod-1", { nombre: "x" })).rejects.toMatchObject({
      code: "UPDATE_PRODUCT_ERROR",
    });
    await expect(deleteProduct("prod-1")).rejects.toMatchObject({ code: "DELETE_PRODUCT_ERROR" });
  });
});
