import type { Product } from "@/interface/products";
import type { ListRowDividerProps, VentasDetallesBaseState } from "@/interface/shared";

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

export interface ResumenState extends VentasDetallesBaseState {}

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
