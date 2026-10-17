import type { TourStep } from "@/interface/onboarding";

export const VENTAS_TOUR: TourStep[] = [
  {
    id: "ventas-1",
    title: "Punto de Venta",
    description:
      "Este es tu carrito. Aquí verás los productos que agregues. Toca Agregar productos para sumarlos.",
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
