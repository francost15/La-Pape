export const METODOS_PAGO = {
  EFECTIVO: "EFECTIVO",
  DEBITO: "DEBITO",
  TRANSFERENCIA: "TRANSFERENCIA",
} as const;

export type MetodoPago = (typeof METODOS_PAGO)[keyof typeof METODOS_PAGO];

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  DEBITO: "Débito",
  TRANSFERENCIA: "Transferencia",
};

export function isMetodoPago(value: string): value is MetodoPago {
  return value === "EFECTIVO" || value === "DEBITO" || value === "TRANSFERENCIA";
}

export function labelMetodoPago(value: string | undefined): string {
  if (value && isMetodoPago(value)) return METODO_PAGO_LABEL[value];
  return "No registrado";
}

/** Acepta 10000, 10.000 y 10,5. El punto se trata como separador de miles. */
export function parseMonto(text: string): number {
  const cleaned = text.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  if (!cleaned) return Number.NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : Number.NaN;
}
