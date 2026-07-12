import { notify } from "@/lib/notify";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils/format";
import { Strings } from "@/constants/strings";
import { completeVentaFlow } from "@/lib/services/ventas/complete-venta";
import { useCheckoutStore } from "@/store/checkout-store";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { useVentasStore } from "@/store/ventas-store";
import { useCallback } from "react";

/**
 * Encapsula la lógica de completar una venta:
 * validación de sesión, llamada al servicio, actualización de stock,
 * notificaciones y manejo de errores.
 *
 * Extraído de CartPanel para separar responsabilidades y facilitar pruebas.
 */
export function useCompleteVenta(onSuccess?: () => void) {
  const items = useVentasStore((s) => s.items);
  const getTotal = useVentasStore((s) => s.getTotal);
  const clearCart = useVentasStore((s) => s.clearCart);
  const negocioId = useSessionStore((s) => s.negocioId);
  const sucursalId = useSessionStore((s) => s.sucursalId);
  const userId = useSessionStore((s) => s.userId);
  const closeConfirm = useCheckoutStore((s) => s.closeConfirm);
  const setProcessing = useCheckoutStore((s) => s.setProcessing);
  const setSuccessVenta = useCheckoutStore((s) => s.setSuccessVenta);

  const completeVenta = useCallback(async () => {
    if (useCheckoutStore.getState().processing) return;

    setProcessing(true);
    closeConfirm();

    if (!negocioId || !userId) {
      notify.error({ title: Strings.errors.session });
      setProcessing(false);
      return;
    }

    try {
      const subtotal = getTotal();
      const result = await completeVentaFlow({
        items,
        negocioId,
        sucursalId: sucursalId ?? "",
        userId,
        total: subtotal,
        subtotal,
      });

      // Actualiza el stock local de forma optimista
      const products = useProductosStore.getState().products;
      const updated = products.map((p) => {
        const cartItem = items.find((i) => i.productId === p.id);
        return cartItem ? { ...p, cantidad: p.cantidad - cartItem.quantity } : p;
      });
      useProductosStore.getState().setProducts(updated);

      onSuccess?.();

      setTimeout(() => {
        clearCart();

        // Fecha + hora con los helpers centralizados (locale es-CL consistente)
        const fechaStr = `${formatDate(result.fecha)} ${formatTime(result.fecha)}`;

        const ventaItems = items.map((i) => ({
          nombre: i.product.nombre,
          cantidad: i.quantity,
          precioUnitario: i.unitPrice,
          totalLinea: i.unitPrice * i.quantity,
        }));

        notify.success({
          title: "Venta completada",
          description: `Total: ${formatCurrency(result.total)}`,
        });

        setSuccessVenta({
          id: result.ventaId,
          fecha: fechaStr,
          total: result.total,
          subtotal,
          descuento: 0,
          items: ventaItems,
        });

        setProcessing(false);
      }, 800);
    } catch (err) {
      console.error("Error al completar venta:", err);
      notify.error({ title: Strings.ventas.errorRegisteringSale });
      setProcessing(false);
      closeConfirm();
    }
  }, [
    items,
    getTotal,
    clearCart,
    negocioId,
    sucursalId,
    userId,
    closeConfirm,
    setProcessing,
    setSuccessVenta,
    onSuccess,
  ]);

  return { completeVenta };
}
