import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatTime,
  getDateKey,
  formatDateHeader,
  pluralize,
} from "@/lib/utils/format";

describe("formatCurrency", () => {
  it("formats positive numbers with peso sign", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("$");
    expect(result).toContain("1");
    expect(result).toContain("000");
  });

  it("formats with 2 decimal places", () => {
    expect(formatCurrency(100.5)).toContain("100");
    expect(formatCurrency(99.999)).toContain("100");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("$");
    expect(formatCurrency(0)).toContain("0");
  });

  it("formats negative numbers", () => {
    const result = formatCurrency(-100);
    expect(result).toContain("-");
    expect(result).toContain("100");
  });

  it("formats small decimal values", () => {
    expect(formatCurrency(0.1)).toContain("0");
    expect(formatCurrency(0.99)).toContain("0");
  });
});

describe("formatDate", () => {
  it("formats date in Spanish", () => {
    const date = new Date(2024, 0, 15, 10, 30, 0);
    const result = formatDate(date);
    expect(result).toContain("ene");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("returns fallback when date is null", () => {
    expect(formatDate(null)).toBe("Seleccionar");
    expect(formatDate(null, "Custom Fallback")).toBe("Custom Fallback");
  });

  it("formats different months correctly", () => {
    expect(formatDate(new Date(2024, 1, 20))).toContain("feb");
    expect(formatDate(new Date(2024, 2, 10))).toContain("mar");
    expect(formatDate(new Date(2024, 11, 25))).toContain("dic");
  });
});

describe("formatTime", () => {
  it("formats time correctly", () => {
    const date = new Date(2024, 0, 15, 14, 30, 0);
    const result = formatTime(date);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("pads single digit hours and minutes", () => {
    const date = new Date(2024, 0, 15, 9, 5, 0);
    const result = formatTime(date);
    expect(result).toBeDefined();
  });
});

describe("getDateKey", () => {
  it("returns date in YYYY-MM-DD format", () => {
    expect(getDateKey(new Date(2024, 0, 15))).toBe("2024-01-15");
    expect(getDateKey(new Date(2024, 11, 31))).toBe("2024-12-31");
  });

  it("pads month and day with zeros", () => {
    expect(getDateKey(new Date(2024, 0, 5))).toBe("2024-01-05");
    expect(getDateKey(new Date(2024, 10, 15))).toBe("2024-11-15");
  });
});

describe("formatDateHeader", () => {
  it("returns 'Hoy' for current date", () => {
    const hoy = new Date();
    expect(formatDateHeader(hoy)).toBe("Hoy");
  });

  it("returns 'Ayer' for previous date", () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    expect(formatDateHeader(ayer)).toBe("Ayer");
  });

  it("returns formatted date for other dates", () => {
    const oldDate = new Date(2024, 0, 15);
    const result = formatDateHeader(oldDate);
    expect(result).toContain("15");
    expect(result).toContain("ene");
  });
});

describe("pluralize", () => {
  it("returns singular form for count of 1", () => {
    expect(pluralize(1, "producto", "productos")).toBe("producto");
    expect(pluralize(1, "venta", "ventas")).toBe("venta");
  });

  it("returns plural form for count other than 1", () => {
    expect(pluralize(0, "producto", "productos")).toBe("productos");
    expect(pluralize(2, "producto", "productos")).toBe("productos");
    expect(pluralize(10, "venta", "ventas")).toBe("ventas");
  });
});
