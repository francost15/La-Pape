import { describe, expect, it } from "vitest";
import { isMetodoPago, labelMetodoPago, parseMonto } from "@/constants/pagos";
import { parseNumeric } from "@/lib/utils/format";

describe("parseMonto", () => {
  it("devuelve NaN si el texto está vacío", () => {
    expect(parseMonto("")).toBeNaN();
    expect(parseMonto("   ")).toBeNaN();
  });

  it("trata el punto como separador de miles", () => {
    expect(parseMonto("10.000")).toBe(10000);
  });

  it("acepta decimal con coma", () => {
    expect(parseMonto("10,5")).toBe(10.5);
  });

  it("devuelve NaN si el texto no es un número", () => {
    expect(parseMonto("abc")).toBeNaN();
  });
});

describe("parseNumeric", () => {
  it("interpreta enteros y cae a 0 si el texto no es válido", () => {
    expect(parseNumeric("12", "integer")).toBe(12);
    expect(parseNumeric("no", "integer")).toBe(0);
    expect(parseNumeric("", "integer")).toBe(0);
  });

  it("reutiliza el formato chileno en decimales", () => {
    expect(parseNumeric("1.250,5", "decimal")).toBe(1250.5);
    expect(parseNumeric("", "decimal")).toBe(0);
  });
});

describe("métodos de pago", () => {
  it("reconoce solo los métodos conocidos", () => {
    expect(isMetodoPago("EFECTIVO")).toBe(true);
    expect(isMetodoPago("CREDITO")).toBe(false);
  });

  it("etiqueta el método o un fallback si no está registrado", () => {
    expect(labelMetodoPago("DEBITO")).toBe("Débito");
    expect(labelMetodoPago(undefined)).toBe("No registrado");
    expect(labelMetodoPago("otro")).toBe("No registrado");
  });
});
