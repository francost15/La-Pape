import { describe, it, expect, beforeEach, vi } from "vitest";
import { filterVentasByPeriodo } from "@/store/filtros-store";
import type { Venta } from "@/interface/ventas";

function createVenta(id: string, fecha: Date): Venta {
  return {
    id,
    negocio_id: "negocio-1",
    sucursal_id: "sucursal-1",
    usuario_id: "usuario-1",
    fecha,
    subtotal: 100,
    descuento: 0,
    total: 100,
    estado: "PAGADA",
    tipo_venta: "CONTADO",
  };
}

describe("filterVentasByPeriodo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("filtrar por semana retorna los últimos 7 días (hoy + 6 días previos)", () => {
    const now = new Date("2026-03-25T12:00:00");
    vi.setSystemTime(now);

    const hace6dias = new Date("2026-03-19T12:00:00");
    const hace7dias = new Date("2026-03-18T12:00:00");
    const hace8dias = new Date("2026-03-17T12:00:00");

    const ventas: Venta[] = [
      createVenta("1", hace6dias),
      createVenta("2", hace7dias),
      createVenta("3", hace8dias),
    ];

    const resultado = filterVentasByPeriodo(ventas, "semana", { inicio: null, fin: null });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("1");
  });

  it("filtrar por hoy retorna solo ventas del día actual (default case)", () => {
    const now = new Date("2026-03-25T12:00:00");
    vi.setSystemTime(now);

    const hoy = new Date("2026-03-25T08:00:00");
    const ayer = new Date("2026-03-24T08:00:00");
    const manana = new Date("2026-03-26T08:00:00");

    const ventas: Venta[] = [
      createVenta("1", hoy),
      createVenta("2", ayer),
      createVenta("3", manana),
    ];

    const resultado = filterVentasByPeriodo(ventas, "semana", { inicio: null, fin: null });

    expect(resultado).toHaveLength(2);
    expect(resultado.map((v) => v.id)).toEqual(["1", "2"]);
  });

  it("filtrar por mes retorna ventas del mes actual", () => {
    const now = new Date("2026-03-25T12:00:00");
    vi.setSystemTime(now);

    const midMarch = new Date("2026-03-15T12:00:00");
    const earlyMarch = new Date("2026-03-01T12:00:00");
    const lateFeb = new Date("2026-02-28T12:00:00");

    const ventas: Venta[] = [
      createVenta("1", midMarch),
      createVenta("2", earlyMarch),
      createVenta("3", lateFeb),
    ];

    const resultado = filterVentasByPeriodo(ventas, "mes", { inicio: null, fin: null });

    expect(resultado).toHaveLength(2);
    expect(resultado.map((v) => v.id)).toEqual(["1", "2"]);
  });

  it("filtrar por año retorna ventas del año actual", () => {
    const now = new Date("2026-03-25T12:00:00");
    vi.setSystemTime(now);

    const marzo2026 = new Date("2026-03-15T12:00:00");
    const enero2026 = new Date("2026-01-01T12:00:00");
    const diciembre2025 = new Date("2025-12-31T12:00:00");

    const ventas: Venta[] = [
      createVenta("1", marzo2026),
      createVenta("2", enero2026),
      createVenta("3", diciembre2025),
    ];

    const resultado = filterVentasByPeriodo(ventas, "año", { inicio: null, fin: null });

    expect(resultado).toHaveLength(2);
    expect(resultado.map((v) => v.id)).toEqual(["1", "2"]);
  });

  it("filtrar por rango personalizado retorna ventas dentro del rango", () => {
    const ahora = new Date("2026-03-25T12:00:00");
    vi.setSystemTime(ahora);

    const dentroDelRango = new Date("2026-03-10T12:00:00");
    const fueraDelRango = new Date("2026-03-05T12:00:00");

    const ventas: Venta[] = [createVenta("1", dentroDelRango), createVenta("2", fueraDelRango)];

    const rango = {
      inicio: new Date("2026-03-08"),
      fin: new Date("2026-03-15"),
    };

    const resultado = filterVentasByPeriodo(ventas, "personalizado", rango);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe("1");
  });

  it("ventas fuera de rango no se incluyen", () => {
    const ahora = new Date("2026-03-25T12:00:00");
    vi.setSystemTime(ahora);

    const ventas: Venta[] = [
      createVenta("1", new Date("2026-03-01")),
      createVenta("2", new Date("2026-02-15")),
      createVenta("3", new Date("2025-12-01")),
    ];

    const rango = {
      inicio: new Date("2026-03-10"),
      fin: new Date("2026-03-20"),
    };

    const resultado = filterVentasByPeriodo(ventas, "personalizado", rango);

    expect(resultado).toHaveLength(0);
  });

  it("rango personalizado sin inicio o fin retorna array vacío", () => {
    const ahora = new Date("2026-03-25T12:00:00");
    vi.setSystemTime(ahora);

    const ventas: Venta[] = [createVenta("1", new Date("2026-03-10"))];

    const resultado1 = filterVentasByPeriodo(ventas, "personalizado", {
      inicio: null,
      fin: new Date("2026-03-15"),
    });
    const resultado2 = filterVentasByPeriodo(ventas, "personalizado", {
      inicio: new Date("2026-03-01"),
      fin: null,
    });

    expect(resultado1).toHaveLength(0);
    expect(resultado2).toHaveLength(0);
  });
});

describe("filterVentasByPeriodo edge cases", () => {
  it("handles empty ventas array", () => {
    expect(filterVentasByPeriodo([], "semana", { inicio: null, fin: null })).toEqual([]);
  });

  it("handles future dates gracefully", () => {
    const now = new Date("2026-03-25T12:00:00");
    vi.setSystemTime(now);

    const ventas = [
      {
        id: "1",
        negocio_id: "negocio-1",
        sucursal_id: "sucursal-1",
        usuario_id: "usuario-1",
        fecha: new Date("2099-01-01"),
        subtotal: 100,
        descuento: 0,
        total: 100,
        estado: "PAGADA" as const,
        tipo_venta: "CONTADO" as const,
      },
    ];
    const result = filterVentasByPeriodo(ventas, "semana", { inicio: null, fin: null });
    expect(result).toHaveLength(0);
  });

  it("handles invalid dates", () => {
    const ventas = [
      {
        id: "1",
        negocio_id: "negocio-1",
        sucursal_id: "sucursal-1",
        usuario_id: "usuario-1",
        fecha: new Date("invalid"),
        subtotal: 100,
        descuento: 0,
        total: 100,
        estado: "PAGADA" as const,
        tipo_venta: "CONTADO" as const,
      },
    ];
    expect(() =>
      filterVentasByPeriodo(ventas, "semana", { inicio: null, fin: null })
    ).not.toThrow();
  });
});
