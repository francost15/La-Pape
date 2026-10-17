import { Strings } from "@/constants/strings";
import type { CartConfirmDialogsProps } from "@/interface/ventas";
import { useCheckoutStore } from "@/store/checkout-store";
import ConfirmAlert from "../../ui/ConfirmAlert";
import { CheckoutDialog } from "./CheckoutDialog";

export function CartConfirmDialogs({
  deleteConfirmItem,
  confirmVisible,
  clearCartConfirmVisible,
  onConfirmRemove,
  onCancelRemove,
  onCompleteVenta,
  onCancelComplete,
  onConfirmClear,
  onCancelClear,
}: CartConfirmDialogsProps) {
  const processing = useCheckoutStore((s) => s.processing);

  return (
    <>
      <ConfirmAlert
        visible={!!deleteConfirmItem}
        title={Strings.ventas.removeFromCart}
        message={deleteConfirmItem ? `¿Quitar "${deleteConfirmItem.nombre}" del carrito?` : ""}
        confirmText={Strings.common.delete}
        cancelText={Strings.common.cancel}
        onConfirm={onConfirmRemove}
        onCancel={onCancelRemove}
        danger
      />
      <CheckoutDialog
        visible={confirmVisible}
        processing={processing}
        onConfirm={onCompleteVenta}
        onCancel={onCancelComplete}
      />
      <ConfirmAlert
        visible={clearCartConfirmVisible}
        title={Strings.ventas.clearCartTitle}
        message={Strings.ventas.confirmClear}
        confirmText={Strings.common.empty}
        cancelText={Strings.common.cancel}
        onConfirm={onConfirmClear}
        onCancel={onCancelClear}
        danger
      />
    </>
  );
}
