import type { Venta } from "@/interface";
import { create } from "zustand";

export type Periodo = "semana" | "mes" | "año" | "personalizado";

export interface RangoFechas {
  inicio: Date | null;
  fin: Date | null;
}

export function filterVentasByPeriodo(
  ventas: Venta[],
  periodo: Periodo,
  rango: RangoFechas,
): Venta[] {
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
        return [];
      }
      break;
    default:
      inicio = new Date(0);
  }

  return ventas.filter((v) => {
    const f = v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
    return f >= inicio && f <= fin;
  });
}

interface FiltrosStore {
  periodo: Periodo;
  rangoPersonalizado: RangoFechas;
  setPeriodo: (periodo: Periodo) => void;
  setRangoPersonalizado: (rango: RangoFechas) => void;
}

export const useFiltrosStore = create<FiltrosStore>((set) => ({
  periodo: 'semana',
  rangoPersonalizado: { inicio: null, fin: null },

  setPeriodo: (periodo) => set({ periodo }),
  setRangoPersonalizado: (rangoPersonalizado) => set({ rangoPersonalizado }),
}));
