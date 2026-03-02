import { Venta, VentaDetalle } from "@/interface";
import { formatDateHeader, getDateKey } from "./format";

export interface VentaGroup {
  key: string;
  label: string;
  ventas: { venta: Venta; detalles: VentaDetalle[]; fecha: Date }[];
  total: number;
}

export function groupVentasByDate(
  ventas: Venta[],
  detallesMap: Record<string, VentaDetalle[]>,
): VentaGroup[] {
  const groups: Record<string, VentaGroup> = {};

  for (const venta of ventas) {
    const fecha =
      venta.fecha instanceof Date ? venta.fecha : new Date(venta.fecha);
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
