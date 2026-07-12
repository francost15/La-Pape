import type { Venta } from "@/interface/ventas";
import type { VentaDetalle } from "@/interface/ventas-detalle";

/** Separador opcional en filas de lista (resumen, rankings, stock). */
export interface ListRowDividerProps {
  showDivider: boolean;
}

/** Estado base compartido entre resumen e historial de ventas. */
export interface VentasDetallesBaseState {
  ventas: Venta[];
  detallesMap: Record<string, VentaDetalle[]>;
  loading: boolean;
  error: string | null;
}

/** Línea de venta para UI, PDF y modal de éxito. */
export interface LineaVentaDisplay {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
}
