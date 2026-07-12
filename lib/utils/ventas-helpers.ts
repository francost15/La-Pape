import type { Venta, HistorySection, VentaListItem } from "@/interface/ventas";
import type { VentaDetalle } from "@/interface/ventas-detalle";
import { formatDateHeader, getDateKey } from "./format";

export type { VentaListItem, HistorySection };

export function groupVentasByDate(
  ventas: Venta[],
  detallesMap: Record<string, VentaDetalle[]>
): HistorySection[] {
  const groups: Record<string, HistorySection> = {};

  for (const venta of ventas) {
    const fecha = venta.fecha instanceof Date ? venta.fecha : new Date(venta.fecha);
    const key = getDateKey(fecha);

    if (!groups[key]) {
      groups[key] = {
        key,
        label: formatDateHeader(fecha),
        ventas: [],
        total: 0,
      };
    }

    groups[key].ventas.push({
      venta,
      detalles: detallesMap[venta.id] ?? [],
      fecha,
    });
    groups[key].total += venta.total;
  }

  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
}
