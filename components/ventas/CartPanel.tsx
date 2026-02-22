import { notify } from "@/lib/notify";
import { completeVentaFlow } from "@/lib/services/ventas/complete-venta";
import { useCheckoutStore } from "@/store/checkout-store";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { useVentasStore } from "@/store/ventas-store";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ConfirmAlert from "../ui/ConfirmAlert";
import { IconSymbol } from "../ui/icon-symbol";
import QuantityStepper from "./QuantityStepper";

const DESKTOP_MIN_WIDTH = 768;

export default function CartPanel() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useVentasStore();
  const { confirmVisible, processing, openConfirm, closeConfirm, setProcessing, setSuccessVenta } =
    useCheckoutStore();
  const { deleteConfirmItem, openDeleteConfirm, closeDeleteConfirm } =
    useVentasUIStore();
  const { negocioId, sucursalId, userId } = useSessionStore();
  const [clearCartConfirmVisible, setClearCartConfirmVisible] = useState(false);
  const total = getTotal();

  const handleClearCartPress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setClearCartConfirmVisible(true);
  }, []);

  const handleConfirmClearCart = useCallback(() => {
    clearCart();
    setClearCartConfirmVisible(false);
    notify.info({ title: "Carrito vaciado" });
  }, [clearCart]);

  const handleCancelClearCart = useCallback(() => {
    setClearCartConfirmVisible(false);
  }, []);

  const handleMinus = useCallback(
    (item: (typeof items)[0]) => {
      if (item.quantity === 1) {
        openDeleteConfirm({
          productId: item.productId,
          nombre: item.product.nombre,
        });
      } else {
        updateQuantity(item.productId, item.quantity - 1);
      }
    },
    [openDeleteConfirm, updateQuantity],
  );

  const handleConfirmRemove = () => {
    if (deleteConfirmItem) {
      removeItem(deleteConfirmItem.productId);
      notify.warning({
        title: `${deleteConfirmItem.nombre} eliminado del carrito`,
      });
      closeDeleteConfirm();
    }
  };

  const handleCompleteVenta = async () => {
    if (useCheckoutStore.getState().processing) return;
    setProcessing(true);
    closeConfirm();

    if (!negocioId || !userId) {
      notify.error({ title: "No se pudo completar: sesión incompleta" });
      setProcessing(false);
      return;
    }
    try {
      const subtotal = getTotal();
      const result = await completeVentaFlow({
        items,
        negocioId,
        sucursalId: sucursalId ?? '',
        userId,
        total: subtotal,
        subtotal,
      });

      // Actualizar stock local sin refetch
      const products = useProductosStore.getState().products;
      const updated = products.map((p) => {
        const cartItem = items.find((i) => i.productId === p.id);
        return cartItem
          ? { ...p, cantidad: p.cantidad - cartItem.quantity }
          : p;
      });
      useProductosStore.getState().setProducts(updated);

      clearCart();

      const fechaStr = result.fecha.toLocaleString("es", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const ventaItems = items.map((i) => ({
        nombre: i.product.nombre,
        cantidad: i.quantity,
        precioUnitario: i.unitPrice,
        totalLinea: i.unitPrice * i.quantity,
      }));

      notify.success({
        title: "Venta completada",
        description: `Total: $${result.total.toLocaleString()}`,
      });
      setSuccessVenta({
        id: result.ventaId,
        fecha: fechaStr,
        total: result.total,
        subtotal,
        descuento: 0,
        items: ventaItems,
      });
    } catch (err) {
      console.error("Error al completar venta:", err);
      notify.error({ title: "Error al registrar la venta" });
      setProcessing(false);
      closeConfirm();
    }
  };

  if (items.length === 0) {
    return (
      <>
        <View className="flex-1 items-center justify-center py-16 px-4">
          <View className="items-center gap-3">
            <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800 items-center justify-center">
              <IconSymbol size={40} name="cart.fill" color="#9ca3af" />
            </View>
            <Text className="text-center text-gray-500 dark:text-gray-400 text-base font-medium">
              Carrito vacío
            </Text>
            <Text className="text-center text-gray-400 dark:text-gray-500 text-sm">
              Agrega productos desde el panel lateral
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <View className="flex-1 flex-col">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <View
            key={item.productId}
            className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-neutral-800 gap-3"
          >
            <View className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-neutral-700 overflow-hidden shrink-0">
              {item.product.imagen?.trim() ? (
                <Image
                  source={{ uri: item.product.imagen }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <IconSymbol name="photo.fill" size={28} color="#9ca3af" />
                </View>
              )}
            </View>
            <View className="flex-1 min-w-0 shrink justify-center gap-0.5 pr-2">
              <Text
                className="text-sm font-medium text-gray-900 dark:text-white"
                numberOfLines={2}
              >
                {item.product.nombre}
              </Text>
              <Text
                className="text-sm font-semibold text-orange-600"
                numberOfLines={1}
              >
                ${item.unitPrice.toLocaleString()} × {item.quantity}
              </Text>
            </View>
            <QuantityStepper
              quantity={item.quantity}
              onMinus={() => handleMinus(item)}
              onPlus={() => updateQuantity(item.productId, item.quantity + 1)}
            />
          </View>
        ))}
      </ScrollView>

      <ConfirmAlert
        visible={!!deleteConfirmItem}
        title="Eliminar del carrito"
        message={
          deleteConfirmItem
            ? `¿Quitar "${deleteConfirmItem.nombre}" del carrito?`
            : ""
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmRemove}
        onCancel={closeDeleteConfirm}
        danger
      />

      <ConfirmAlert
        visible={confirmVisible}
        title="Completar venta"
        message="¿Estás seguro de completar esta venta? Se generará el recibo y se vaciará el carrito."
        confirmText="Aceptar"
        cancelText="Cancelar"
        onConfirm={handleCompleteVenta}
        onCancel={closeConfirm}
        danger={false}
      />

      <ConfirmAlert
        visible={clearCartConfirmVisible}
        title="Vaciar carrito"
        message="¿Estás seguro de vaciar el carrito? Se eliminarán todos los productos."
        confirmText="Vaciar"
        cancelText="Cancelar"
        onConfirm={handleConfirmClearCart}
        onCancel={handleCancelClearCart}
        danger
      />

      <View className="px-3 pt-3 pb-2 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <View className="flex-row justify-between items-center mb-2.5 px-1">
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total
          </Text>
          <Text className="text-xl font-bold text-orange-600">
            ${total.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-2xl py-3.5 bg-orange-500 items-center justify-center active:opacity-90"
          activeOpacity={0.9}
          onPress={openConfirm}
          disabled={processing}
          style={processing ? { opacity: 0.6 } : undefined}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white tracking-tight">
              Completar venta
            </Text>
          )}
        </TouchableOpacity>

        {isDesktop && (
          <TouchableOpacity
            className="mt-2 rounded-2xl py-3 flex-row items-center justify-center gap-1.5 border border-orange-500/40 active:opacity-90"
            activeOpacity={0.85}
            onPress={handleClearCartPress}
          >
            <Text className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              Limpiar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
