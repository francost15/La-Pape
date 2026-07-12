import type { ReactNode } from "react";
import type { Product } from "@/interface/products";
import type { ListRowDividerProps, VentasDetallesBaseState } from "@/interface/shared";

// ─── ResumenRow (fila compartida de listas de resumen) ─────────────────────
export interface ResumenRowProps extends ListRowDividerProps {
  /** Contenido a la izquierda (thumbnail o avatar). */
  leading?: ReactNode;
  /** Número de posición mostrado antes del leading (rankings). */
  rank?: number;
  title: string;
  subtitle?: string;
  /** Contenido alineado a la derecha (monto, badge de stock…). */
  trailing?: ReactNode;
  onPress?: () => void;
  /** Contenido extra debajo de la fila (p. ej. barra de participación). */
  children?: ReactNode;
}

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

export type ResumenState = VentasDetallesBaseState;

export interface ResumenActions {
  subscribe: (negocioId: string) => () => void;
  reset: () => void;
}

export type ResumenStore = ResumenState & ResumenActions;

// ─── ProductosBajoStockList ────────────────────────────────────────────────

export interface StockRowProps extends ListRowDividerProps {
  product: Product;
}

export interface ProductosBajoStockListProps {
  items: Product[];
}

// ─── VentasPorUsuario ──────────────────────────────────────────────────────

export interface VentasPorUsuarioRowProps extends ListRowDividerProps {
  item: VentasPorUsuario;
  porcentajeDelTotal: number;
  index: number;
}

export interface VentasPorUsuarioProps {
  data: VentasPorUsuario[];
}

// ─── TopProductsList ───────────────────────────────────────────────────────

export interface RankingRowProps extends ListRowDividerProps {
  item: ProductoRanking;
  rank: number;
}

export interface TopProductsListProps {
  title: string;
  items: ProductoRanking[];
}

// ─── KpiGrid ───────────────────────────────────────────────────────────────

export interface KpiCardConfig {
  label: string;
  value: string;
  subtitle: string;
  accentColor: string;
}

export interface KpiCardProps extends KpiCardConfig {
  index: number;
}

export interface KpiGridProps {
  metricas: Metricas;
  isMobile: boolean;
}

// ─── CategoryBreakdown ─────────────────────────────────────────────────────

export interface LegendItemProps {
  color: string;
  label: string;
  value: number;
  percentage: number;
}

export interface CategoryBreakdownProps {
  data: CategoriaVenta[];
  isMobile: boolean;
}
