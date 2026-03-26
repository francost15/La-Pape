import { TourStep } from "@/components/onboarding/Tour";

export const VENTAS_TOUR: TourStep[] = [
  {
    id: "ventas-1",
    title: "Punto de Venta",
    description:
      "Este es tu carrito. Aquí verás los productos que agregues. Toca el + para añadir productos.",
  },
  {
    id: "ventas-2",
    title: "Agregar Productos",
    description: "Busca productos por nombre o usa el escáner QR para añadirlos rápidamente.",
  },
  {
    id: "ventas-3",
    title: "Completar Venta",
    description: "Cuando estés listo, toca Completar venta para registrar la transacción.",
  },
];

export const PRODUCTOS_TOUR: TourStep[] = [
  {
    id: "productos-1",
    title: "Tu Catálogo",
    description: "Aquí están todos tus productos. Toca + para crear uno nuevo.",
  },
  {
    id: "productos-2",
    title: "Editar Producto",
    description: "Toca cualquier producto para ver sus detalles o modificarlo.",
  },
];

export const HISTORY_TOUR: TourStep[] = [
  {
    id: "history-1",
    title: "Historial de Ventas",
    description: "Todas tus ventas organizadas por fecha. Filtra por período arriba.",
  },
  {
    id: "history-2",
    title: "Ver Recibo",
    description: "Toca una venta para ver el detalle y generar su recibo.",
  },
  {
    id: "history-3",
    title: "Reembolsos",
    description: '¿Necesitas revertir una venta? Toca "Reembolsar" en la venta.',
  },
];

export const RESUMEN_TOUR: TourStep[] = [
  {
    id: "resumen-1",
    title: "Dashboard",
    description: "Métricas de tu negocio: ventas totales, productos más vendidos, y más.",
  },
  {
    id: "resumen-2",
    title: "Filtro de Período",
    description: "Cambia el período para ver métricas de diferentes rangos de tiempo.",
  },
];

export const ALL_TOUR_IDS = ["ventas", "productos", "historial", "resumen"] as const;
export type TourId = (typeof ALL_TOUR_IDS)[number];
