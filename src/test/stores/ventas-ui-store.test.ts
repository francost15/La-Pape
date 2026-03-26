import { describe, it, expect, beforeEach } from "vitest";
import { useVentasUIStore } from "@/store/ventas-ui-store";

describe("VentasUIStore", () => {
  beforeEach(() => {
    useVentasUIStore.setState({
      sheetVisible: false,
      deleteConfirmItem: null,
    });
  });

  it("should have initial state", () => {
    expect(useVentasUIStore.getState().sheetVisible).toBe(false);
    expect(useVentasUIStore.getState().deleteConfirmItem).toBe(null);
  });

  it("should open sheet", () => {
    useVentasUIStore.getState().openSheet();
    expect(useVentasUIStore.getState().sheetVisible).toBe(true);
  });

  it("should close sheet", () => {
    useVentasUIStore.getState().openSheet();
    useVentasUIStore.getState().closeSheet();
    expect(useVentasUIStore.getState().sheetVisible).toBe(false);
  });

  it("should set sheet visible", () => {
    useVentasUIStore.getState().setSheetVisible(true);
    expect(useVentasUIStore.getState().sheetVisible).toBe(true);
  });

  it("should set sheet invisible", () => {
    useVentasUIStore.getState().setSheetVisible(true);
    useVentasUIStore.getState().setSheetVisible(false);
    expect(useVentasUIStore.getState().sheetVisible).toBe(false);
  });

  it("should open delete confirm with item", () => {
    const item = { productId: "prod-1", nombre: "Test Product" };
    useVentasUIStore.getState().openDeleteConfirm(item);
    expect(useVentasUIStore.getState().deleteConfirmItem).toEqual(item);
  });

  it("should close delete confirm", () => {
    const item = { productId: "prod-1", nombre: "Test Product" };
    useVentasUIStore.getState().openDeleteConfirm(item);
    useVentasUIStore.getState().closeDeleteConfirm();
    expect(useVentasUIStore.getState().deleteConfirmItem).toBe(null);
  });
});
