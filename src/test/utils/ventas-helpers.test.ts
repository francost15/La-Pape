import { describe, it, expect } from "vitest";
import { groupVentasByDate } from "@/lib/utils/ventas-helpers";
import type { Venta } from "@/interface/ventas";

function createVenta(id: string, fecha: Date, total: number): Venta {
  return {
    id,
    negocio_id: "negocio-1",
    sucursal_id: "sucursal-1",
    usuario_id: "usuario-1",
    fecha,
    subtotal: total,
    descuento: 0,
    total,
    estado: "PAGADA",
    tipo_venta: "CONTADO",
  };
}

describe("groupVentasByDate", () => {
  it("groups ventas by date correctly", () => {
    const ventas = [
      createVenta("1", new Date(2024, 0, 15, 10, 0, 0), 100),
      createVenta("2", new Date(2024, 0, 15, 14, 0, 0), 200),
      createVenta("3", new Date(2024, 0, 16, 9, 0, 0), 150),
    ];

    const grouped = groupVentasByDate(ventas, {});

    expect(grouped.length).toBeGreaterThanOrEqual(1);
    expect(grouped[0].ventas.length).toBeGreaterThanOrEqual(1);
    expect(grouped[0].key).toBeDefined();
    expect(grouped[0].total).toBeGreaterThan(0);
  });

  it("calculates totals per group", () => {
    const ventas = [
      createVenta("1", new Date(2024, 0, 15, 10, 0, 0), 100),
      createVenta("2", new Date(2024, 0, 15, 14, 0, 0), 200),
    ];

    const grouped = groupVentasByDate(ventas, {});

    expect(grouped[0].total).toBe(300);
  });

  it("handles empty ventas array", () => {
    const grouped = groupVentasByDate([], {});
    expect(grouped).toHaveLength(0);
  });

  it("sorts groups by date descending", () => {
    const ventas = [
      createVenta("1", new Date(2024, 0, 15, 10, 0, 0), 100),
      createVenta("2", new Date(2024, 0, 17, 10, 0, 0), 200),
      createVenta("3", new Date(2024, 0, 16, 10, 0, 0), 150),
    ];

    const grouped = groupVentasByDate(ventas, {});

    expect(grouped.length).toBe(3);
    const keys = grouped.map((g) => g.key);
    expect(keys[0]).toBe("2024-01-17");
    expect(keys[1]).toBe("2024-01-16");
    expect(keys[2]).toBe("2024-01-15");
  });

  it("includes detalles when provided in detallesMap", () => {
    const ventas = [createVenta("1", new Date(2024, 0, 15, 10, 0, 0), 100)];
    const detallesMap = {
      "1": [
        {
          id: "d1",
          venta_id: "1",
          producto_id: "p1",
          cantidad: 2,
          precio_unitario: 50,
          total_linea: 100,
        } as any,
      ],
    };

    const grouped = groupVentasByDate(ventas, detallesMap);

    expect(grouped[0].ventas[0].detalles).toHaveLength(1);
    expect(grouped[0].ventas[0].detalles[0].id).toBe("d1");
  });

  it("handles string dates in venta", () => {
    const ventaWithStringDate = {
      ...createVenta("1", new Date(2024, 0, 15, 10, 0, 0), 100),
      fecha: "2024-01-15T10:00:00" as unknown as Date,
    };

    const grouped = groupVentasByDate([ventaWithStringDate], {});
    expect(grouped).toHaveLength(1);
    expect(grouped[0].key).toBe("2024-01-15");
  });

  it("handles missing detalles in detallesMap", () => {
    const ventas = [createVenta("1", new Date(2024, 0, 15, 10, 0, 0), 100)];

    const grouped = groupVentasByDate(ventas, {});

    expect(grouped[0].ventas[0].detalles).toHaveLength(0);
  });
});
