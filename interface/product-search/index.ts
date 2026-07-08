import type { Periodo, RangoFechas } from "@/interface/filtros";

export type SearchContextId = "productos" | "ventas";

export interface SearchState {
  searchText: string;
  selectedCategoryId: string | null;
}

export interface ProductSearchStore {
  contexts: Record<SearchContextId, SearchState>;
  setSearchText: (contextId: SearchContextId, text: string) => void;
  setSelectedCategoryId: (contextId: SearchContextId, categoryId: string | null) => void;
  getSearchState: (contextId: SearchContextId) => SearchState;
  resetContext: (contextId: SearchContextId) => void;
}

export interface CustomRangeContentProps {
  rangoTemporal: RangoFechas;
  onRangoChange: (rango: RangoFechas) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isMobile: boolean;
}

export interface PeriodBadgesProps {
  periodo: Periodo;
  onSelect: (p: Periodo) => void;
  isMobile: boolean;
}

export interface PeriodFilterProps {
  periodo: Periodo;
  onPeriodoChange: (periodo: Periodo) => void;
  rangoPersonalizado?: RangoFechas;
  onRangoPersonalizadoChange?: (rango: RangoFechas) => void;
  formatDate?: (date: Date | null) => string;
}

export interface SearchProductsProps {
  searchText: string;
  onSearchChange: (searchText: string) => void;
  size?: "default" | "large";
  showQrButton?: boolean;
  onQrPress?: () => void;
}

export interface RangeCalendarProps {
  rango: RangoFechas;
  onRangoChange: (r: RangoFechas) => void;
}
