import type { Product } from "@/interface/products";
import type { VentaDetalle } from "@/interface/ventas-detalle";
import type { LineaVentaDisplay, VentasDetallesBaseState } from "@/interface/shared";
import type { SearchContextId } from "@/interface/product-search";
import type { ThemeColors } from "@/interface/theme";
import type { RefObject } from "react";
import type { TextInput } from "react-native";
import type { SharedValue } from "react-native-reanimated";

export type VentaEstado = "PENDIENTE" | "PAGADA" | "CANCELADA" | "REEMBOLSO" | "EN_PROCESO";
export type TipoVenta = "CONTADO" | "CREDITO";

// ── Flujo de checkout (antes en interface/checkout, fusionado aquí para
// eliminar la dependencia cruzada ventas ↔ checkout) ──────────────────────

/** Venta recién completada, tal como la consume el modal de éxito. */
export interface VentaCompletada {
  id: string;
  fecha: string; // preformateada para display (no es la fecha cruda de Firestore)
  total: number;
  subtotal: number;
  descuento: number;
  items: LineaVentaDisplay[];
}

export interface CheckoutStore {
  confirmVisible: boolean;
  processing: boolean;
  successVenta: VentaCompletada | null;

  openConfirm: () => void;
  closeConfirm: () => void;
  setProcessing: (v: boolean) => void;
  setSuccessVenta: (venta: VentaCompletada) => void;
  closeSuccess: () => void;
}

export interface Venta {
  id: string;
  negocio_id: string; // FK
  sucursal_id: string; // FK
  usuario_id: string; // FK
  cliente_id?: string; // FK (opcional)
  fecha: Date; // timestamptz
  subtotal: number; // float
  descuento: number; // float
  total: number; // float
  estado: VentaEstado; // enum
  tipo_venta: TipoVenta;
  notas?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateVentaInput {
  negocio_id: string;
  sucursal_id: string;
  usuario_id: string;
  cliente_id?: string;
  fecha?: Date;
  subtotal: number;
  descuento?: number;
  total: number;
  estado?: VentaEstado;
  tipo_venta?: TipoVenta;
  notas?: string;
}

export interface UpdateVentaInput {
  cliente_id?: string;
  subtotal?: number;
  descuento?: number;
  total?: number;
  estado?: VentaEstado;
  tipo_venta?: TipoVenta;
  notas?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface VentasStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export interface DeleteConfirmItem {
  productId: string;
  nombre: string;
}

export interface VentasUIStore {
  sheetVisible: boolean;
  deleteConfirmItem: DeleteConfirmItem | null;
  qrScannerVisible: boolean;
  clearCartConfirmVisible: boolean;
  isClearing: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  setSheetVisible: (visible: boolean) => void;
  openDeleteConfirm: (item: DeleteConfirmItem) => void;
  closeDeleteConfirm: () => void;
  openQrScanner: () => void;
  closeQrScanner: () => void;
  openClearCartConfirm: () => void;
  closeClearCartConfirm: () => void;
  setIsClearing: (value: boolean) => void;
}

export interface VentaCardProps {
  venta: Venta;
  detalles: VentaDetalle[];
  fecha: Date;
  isReembolso: boolean;
  expandido: boolean;
  productNames: Record<string, string>;
  onToggle: () => void;
  onVerRecibo: (v: Venta) => void;
  onReembolso: (v: Venta) => void;
}

export interface QrScannerSheetProps {
  visible: boolean;
  onClose: () => void;
  onProductAdded?: (productName: string) => void;
}

export interface CartItemRowProps {
  item: CartItem;
  isDark: boolean;
  colors: ThemeColors;
  onMinus: (item: CartItem) => void;
  onPlus: (item: CartItem) => void;
}

export interface QuantityStepperProps {
  quantity: number;
  onMinus: () => void;
  onPlus: () => void;
  size?: number;
}

export interface ProductListContentProps {
  searchContextId: SearchContextId;
  onProductAdded?: (productName: string) => void;
  searchSize?: "default" | "large";
  showQrButton?: boolean;
  onQrPress?: () => void;
  listKey?: string;
  contentContainerStyle?: object;
  keyboardDismissMode?: "none" | "on-drag" | "interactive";
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  searchInputRef?: RefObject<TextInput | null>;
}

export interface CartFooterProps {
  total: number;
  colors: ThemeColors;
  isDesktop: boolean;
  processing: boolean;
  isClearing: boolean;
  reduceMotion: boolean;
  successOpacity: SharedValue<number>;
  successScale: SharedValue<number>;
  onComplete: () => void;
  onClearCart: () => void;
}

export interface CartConfirmDialogsProps {
  deleteConfirmItem: { nombre: string } | null;
  confirmVisible: boolean;
  clearCartConfirmVisible: boolean;
  onConfirmRemove: () => void;
  onCancelRemove: () => void;
  onCompleteVenta: () => void;
  onCancelComplete: () => void;
  onConfirmClear: () => void;
  onCancelClear: () => void;
}

export interface ProductRowProps {
  product: Product;
  onProductAdded?: (nombre: string) => void;
  /** Muestra la marca bajo el nombre. Default: solo en mobile. */
  showBrand?: boolean;
  /** Dibuja el divisor inferior. Default: solo en mobile. */
  divider?: boolean;
}

export interface VentaExitosaModalProps {
  visible: boolean;
  venta: VentaCompletada;
  onClose: () => void;
  onDescargarRecibo?: () => void;
  onEnviarRecibo?: () => void;
}

export interface SuccessActionsProps {
  isDark: boolean;
  colors: ThemeColors;
  onContinuar: () => void;
  onDescargarRecibo?: () => void;
  onEnviarRecibo?: () => void;
}

export interface SuccessDetailsProps {
  venta: VentaCompletada;
  isDark: boolean;
  colors: ThemeColors;
}

export interface SuccessHeaderProps {
  colors: ThemeColors;
}

/** Item individual en listas de historial de ventas. */
export interface VentaListItem {
  venta: Venta;
  detalles: VentaDetalle[];
  fecha: Date;
}

/** Sección agrupada por fecha en el historial. */
export interface HistorySection {
  key: string;
  label: string;
  ventas: VentaListItem[];
  total: number;
}

export interface HistoryState extends VentasDetallesBaseState {
  refundTarget: Venta | null;
  refunding: boolean;
  expandedIds: string[];
}

export interface HistoryStore extends HistoryState {
  subscribe: (negocioId: string) => () => void;
  reset: () => void;
  toggleCard: (ventaId: string) => void;
  openRefund: (venta: Venta) => void;
  cancelRefund: () => void;
  confirmRefund: (args: { sucursalId?: string | null; userId: string }) => Promise<void>;
  verRecibo: (venta: Venta, productNames: Record<string, string>) => Promise<void>;
}
