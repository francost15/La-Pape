import type { Product } from "@/interface/products";
import type { Venta } from "@/interface/ventas";
import type { VentaDetalle } from "@/interface/ventas-detalle";

export interface Metricas {
  ventasTotales: number;
  gananciaNeta: number;
  transacciones: number;
  devoluciones: number;
  totalDevoluciones: number;
  porcentajeGanancia: number;
  promedioTransaccion: number;
}

export interface ProductoRanking {
  producto: Product;
  cantidad: number;
  total: number;
}

export interface CategoriaVenta {
  nombre: string;
  total: number;
}

export interface VentasPorUsuario {
  usuario_id: string;
  nombre: string;
  total: number;
  transacciones: number;
  foto?: string;
}

export interface ResumenState {
  ventas: Venta[];
  detallesMap: Record<string, VentaDetalle[]>;
  loading: boolean;
  error: string | null;
}

export interface ResumenActions {
  subscribe: (negocioId: string) => () => void;
  reset: () => void;
}

export type ResumenStore = ResumenState & ResumenActions;
