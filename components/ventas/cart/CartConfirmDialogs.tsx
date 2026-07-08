import { Strings } from "@/constants/strings";
import ConfirmAlert from "../../ui/ConfirmAlert";

interface CartConfirmDialogsProps {
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
      <ConfirmAlert
        visible={confirmVisible}
        title={Strings.ventas.completeSale}
        message={Strings.ventas.confirmComplete}
        confirmText={Strings.ventas.accept}
        cancelText={Strings.common.cancel}
        onConfirm={onCompleteVenta}
        onCancel={onCancelComplete}
        danger={false}
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
