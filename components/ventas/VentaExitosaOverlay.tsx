import { generateAndShareRecibo } from "@/lib/pdf/generate-recibo";
import type { ReciboData } from "@/lib/pdf/recibo-template";
import { notify } from "@/lib/notify";
import { useCheckoutStore } from "@/store/checkout-store";
import React, { useCallback } from "react";
import VentaExitosaModal from "./VentaExitosaModal";

export default function VentaExitosaOverlay() {
  const successVenta = useCheckoutStore((s) => s.successVenta);
  const closeSuccess = useCheckoutStore((s) => s.closeSuccess);

  const handleDescargarRecibo = useCallback(async () => {
    if (!successVenta) return;

    const reciboData: ReciboData = {
      ventaId: successVenta.id,
      fecha: new Date(successVenta.fecha),
      items: successVenta.items,
      subtotal: successVenta.subtotal,
      descuento: successVenta.descuento,
      total: successVenta.total,
      metodoPago: "Efectivo",
    };

    try {
      await generateAndShareRecibo(reciboData);
    } catch (err) {
      console.error("Error generando recibo:", err);
      notify.error({ title: "No se pudo generar el recibo" });
    }
  }, [successVenta]);

  if (!successVenta) return null;

  return (
    <VentaExitosaModal
      visible
      venta={successVenta}
      onClose={closeSuccess}
      onDescargarRecibo={handleDescargarRecibo}
      onEnviarRecibo={() => {}}
    />
  );
}
