import { useCheckoutStore } from "@/store/checkout-store";
import { useVentasStore } from "@/store/ventas-store";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import ConfirmAlert from "../ui/ConfirmAlert";
import { IconSymbol } from "../ui/icon-symbol";
import VentaExitosaModal from "./VentaExitosaModal";

export default function CartPanel() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useVentasStore();
  const {
    confirmVisible,
    successVenta,
    openConfirm,
    closeConfirm,
    setSuccessVenta,
    closeSuccess,
  } = useCheckoutStore();
  const total = getTotal();
  const [alertItem, setAlertItem] = useState<{
    productId: string;
    nombre: string;
  } | null>(null);

  const handleMinus = (item: (typeof items)[0]) => {
    if (item.quantity === 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setAlertItem({ productId: item.productId, nombre: item.product.nombre });
    } else {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleConfirmRemove = () => {
    if (alertItem) {
      removeItem(alertItem.productId);
      setAlertItem(null);
    }
  };

  const handleCompleteVenta = () => {
    const totalVenta = getTotal();
    const now = new Date();
    const id = now.getTime().toString();
    const fecha = now.toLocaleString("es", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    clearCart();
    setSuccessVenta({ id, fecha, total: totalVenta });
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
        {successVenta && (
          <VentaExitosaModal
            visible
            venta={successVenta}
            onClose={closeSuccess}
            onDescargarRecibo={() => {}}
            onEnviarRecibo={() => {}}
          />
        )}
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
            <View className="flex-row items-center shrink-0 gap-1.5">
              <TouchableOpacity
                onPress={() => handleMinus(item)}
                className="w-9 h-9 rounded-full bg-gray-200 dark:bg-neutral-700 items-center justify-center"
              >
                <IconSymbol
                  name="minus.circle.fill"
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
              <Text className="text-base font-semibold text-gray-900 dark:text-white w-7 text-center">
                {item.quantity}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
                className="w-9 h-9 rounded-full bg-orange-500 items-center justify-center"
              >
                <IconSymbol name="plus.circle.fill" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <ConfirmAlert
        visible={!!alertItem}
        title="Eliminar del carrito"
        message={alertItem ? `¿Quitar "${alertItem.nombre}" del carrito?` : ""}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmRemove}
        onCancel={() => setAlertItem(null)}
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

      {successVenta && (
        <VentaExitosaModal
          visible={!!successVenta}
          venta={successVenta}
          onClose={closeSuccess}
          onDescargarRecibo={() => {}}
          onEnviarRecibo={() => {}}
        />
      )}

      <View className="px-4 py-4 gap-4 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-semibold text-gray-900 dark:text-white">
            Total:
          </Text>
          <Text className="text-xl font-bold text-orange-600">
            ${total.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-orange-500 rounded-xl py-4 items-center justify-center active:opacity-90"
          activeOpacity={0.9}
          onPress={openConfirm}
        >
          <Text className="text-base font-semibold text-white">
            Completar venta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
