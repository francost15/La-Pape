import type { FiltrosStore, Periodo, RangoFechas } from "@/interface/filtros";
import type { Venta } from "@/interface/ventas";
import type { VentasQueryOptions } from "@/lib/services/ventas";
import { create } from "zustand";

/**
 * Resuelve el rango de fechas absoluto que representa un período.
 * Devuelve null cuando el período personalizado está incompleto.
 */
function resolverRango(periodo: Periodo, rango: RangoFechas): { inicio: Date; fin: Date } | null {
  const ahora = new Date();
  ahora.setHours(23, 59, 59, 999);
  let inicio: Date;
  let fin: Date = ahora;

  switch (periodo) {
    case "semana":
      inicio = new Date(ahora);
      inicio.setDate(inicio.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);
      break;
    case "mes":
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      inicio.setHours(0, 0, 0, 0);
      break;
    case "año":
      inicio = new Date(ahora.getFullYear(), 0, 1);
      inicio.setHours(0, 0, 0, 0);
      break;
    case "personalizado":
      if (rango.inicio && rango.fin) {
        inicio = new Date(rango.inicio);
        inicio.setHours(0, 0, 0, 0);
        fin = new Date(rango.fin);
        fin.setHours(23, 59, 59, 999);
      } else {
        return null;
      }
      break;
    default:
      inicio = new Date(0);
  }

  return { inicio, fin };
}

export function filterVentasByPeriodo(
  ventas: Venta[],
  periodo: Periodo,
  rango: RangoFechas
): Venta[] {
  const resuelto = resolverRango(periodo, rango);
  if (!resuelto) return [];
  const { inicio, fin } = resuelto;

  return ventas.filter((v) => {
    const f = v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
    return f >= inicio && f <= fin;
  });
}

/**
 * Traduce el período activo a las opciones de consulta del listener de ventas.
 * Para períodos relativos (semana/mes/año) solo acota el inicio: dejar el tope
 * abierto permite que las ventas nuevas sigan llegando en tiempo real sin
 * re-suscribirse cada día. Devuelve null si no se puede acotar (se usa el
 * límite por defecto del servicio).
 */
export function getRangoConsulta(periodo: Periodo, rango: RangoFechas): VentasQueryOptions | null {
  const resuelto = resolverRango(periodo, rango);
  if (!resuelto) return null;
  if (periodo === "personalizado") return { desde: resuelto.inicio, hasta: resuelto.fin };
  return { desde: resuelto.inicio };
}

export const useFiltrosStore = create<FiltrosStore>((set) => ({
  periodo: "semana",
  rangoPersonalizado: { inicio: null, fin: null },

  setPeriodo: (periodo) => set({ periodo }),
  setRangoPersonalizado: (rangoPersonalizado) => set({ rangoPersonalizado }),
}));
