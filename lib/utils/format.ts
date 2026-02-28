/**
 * Shared formatting utilities for currency, dates, and text.
 *
 * Centraliza la lógica de formato para evitar duplicación entre componentes.
 * Usar es-CL como locale porque el mercado objetivo es Chile (símbolo $, punto como separador de miles).
 */

/**
 * Formatea un número como moneda con prefijo $ y 2 decimales.
 * Ejemplo: 12345.6 → "$12.345,60"
 */
export function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formatea una fecha como string legible en español.
 * Retorna `fallback` si la fecha es null.
 */
export function formatDate(date: Date | null, fallback = "Seleccionar"): string {
  if (!date) return fallback;
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Retorna la forma plural o singular según el conteo.
 * Ejemplo: pluralize(1, "venta", "ventas") → "venta"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
