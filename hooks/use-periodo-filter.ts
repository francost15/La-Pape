import type { Venta } from "@/interface/ventas";
import { filterVentasByPeriodo, useFiltrosStore } from "@/store/filtros-store";
import { useMemo } from "react";

/** Encapsula filtros de periodo compartidos entre historial y resumen. */
export function usePeriodoFilter(ventas: Venta[]) {
  const periodo = useFiltrosStore((s) => s.periodo);
  const rangoPersonalizado = useFiltrosStore((s) => s.rangoPersonalizado);
  const setPeriodo = useFiltrosStore((s) => s.setPeriodo);
  const setRangoPersonalizado = useFiltrosStore((s) => s.setRangoPersonalizado);

  const ventasFiltradas = useMemo(
    () => filterVentasByPeriodo(ventas, periodo, rangoPersonalizado),
    [ventas, periodo, rangoPersonalizado]
  );

  return {
    periodo,
    rangoPersonalizado,
    setPeriodo,
    setRangoPersonalizado,
    ventasFiltradas,
  };
}
