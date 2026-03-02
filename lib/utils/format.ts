/**
 * Shared formatting utilities for currency, dates, and text.
 *
 * Centraliza la lógica de formato para evitar duplicación entre componentes.
 * Usar es-CL como locale porque el mercado objetivo es Chile (símbolo $, punto como separador de miles).
 */

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: Date | null, fallback = "Seleccionar"): string {
  if (!date) return fallback;
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(fecha: Date): string {
  return fecha.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getDateKey(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

export function formatDateHeader(fecha: Date): string {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  if (getDateKey(fecha) === getDateKey(hoy)) return "Hoy";
  if (getDateKey(fecha) === getDateKey(ayer)) return "Ayer";

  return fecha.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
  });
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
