import { notify } from "@/lib/notify";
import { AppFonts } from "@/constants/typography";
import { Strings } from "@/constants/strings";
import { completeVentaFlow } from "@/lib/services/ventas/complete-venta";
import { useCheckoutStore } from "@/store/checkout-store";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import { useVentasStore } from "@/store/ventas-store";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import { useHaptic } from "@/hooks/use-haptic";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import type { CartItem } from "@/store/ventas-store";
import ConfirmAlert from "../ui/ConfirmAlert";
import { IconSymbol } from "../ui/icon-symbol";
import EmptyState from "../ui/EmptyState";
import QuantityStepper from "./QuantityStepper";
import { DesignSystem } from "@/constants/design-system";

const DESKTOP_MIN_WIDTH = 768;

export default function CartPanel() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const storeItems = useVentasStore((s) => s.items);
  const removeItem = useVentasStore((s) => s.removeItem);
  const updateQuantity = useVentasStore((s) => s.updateQuantity);
  const getTotal = useVentasStore((s) => s.getTotal);
  const clearCart = useVentasStore((s) => s.clearCart);
  const confirmVisible = useCheckoutStore((s) => s.confirmVisible);
  const processing = useCheckoutStore((s) => s.processing);
  const openConfirm = useCheckoutStore((s) => s.openConfirm);
  const closeConfirm = useCheckoutStore((s) => s.closeConfirm);
  const setProcessing = useCheckoutStore((s) => s.setProcessing);
  const setSuccessVenta = useCheckoutStore((s) => s.setSuccessVenta);
  const deleteConfirmItem = useVentasUIStore((s) => s.deleteConfirmItem);
  const openDeleteConfirm = useVentasUIStore((s) => s.openDeleteConfirm);
  const closeDeleteConfirm = useVentasUIStore((s) => s.closeDeleteConfirm);
  const negocioId = useSessionStore((s) => s.negocioId);
  const sucursalId = useSessionStore((s) => s.sucursalId);
  const userId = useSessionStore((s) => s.userId);
  const [clearCartConfirmVisible, setClearCartConfirmVisible] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const haptic = useHaptic();
  const {
    present: items,
    set: setCart,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<typeof storeItems>(storeItems);
  const total = getTotal();

  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const listOpacity = useSharedValue(1);

  const playSuccessAnimation = useCallback(() => {
    successOpacity.value = withTiming(1, { duration: DesignSystem.animations.fast });
    successScale.value = withSequence(
      withSpring(0, { damping: 4, stiffness: 200 }),
      withSpring(1.2, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 350 })
    );
  }, [successOpacity, successScale]);

  const resetSuccessAnimation = useCallback(() => {
    successScale.value = 0;
    successOpacity.value = 0;
  }, [successScale, successOpacity]);

  const handleClearCartPress = useCallback(() => {
    haptic();
    setClearCartConfirmVisible(true);
  }, [haptic]);

  const handleConfirmClearCart = useCallback(() => {
    setIsClearing(true);
    listOpacity.value = withTiming(0, { duration: DesignSystem.animations.normal });

    setTimeout(() => {
      setCart([]);
      clearCart();
      setIsClearing(false);
      listOpacity.value = 1;
      notify.info({ title: Strings.ventas.cartEmptied });
    }, DesignSystem.animations.normal + 100);

    setClearCartConfirmVisible(false);
  }, [clearCart, setCart, listOpacity]);

  const handleCancelClearCart = useCallback(() => {
    listOpacity.value = withSpring(1, { damping: 10, stiffness: 200 });
    setIsClearing(false);
    setClearCartConfirmVisible(false);
  }, [listOpacity]);

  const handleMinus = useCallback(
    (item: (typeof items)[0]) => {
      setCart([...items]);
      if (item.quantity === 1) {
        openDeleteConfirm({
          productId: item.productId,
          nombre: item.product.nombre,
        });
      } else {
        updateQuantity(item.productId, item.quantity - 1);
      }
    },
    [openDeleteConfirm, updateQuantity, items, setCart]
  );

  const handleConfirmRemove = () => {
    if (deleteConfirmItem) {
      setCart(items.filter((i) => i.productId !== deleteConfirmItem.productId));
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

      const products = useProductosStore.getState().products;
      const updated = products.map((p) => {
        const cartItem = items.find((i) => i.productId === p.id);
        return cartItem ? { ...p, cantidad: p.cantidad - cartItem.quantity } : p;
      });
      useProductosStore.getState().setProducts(updated);

      playSuccessAnimation();

      setTimeout(() => {
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

        resetSuccessAnimation();
        setProcessing(false);
      }, 800);
    } catch (err) {
      console.error("Error al completar venta:", err);
      notify.error({ title: Strings.ventas.errorRegisteringSale });
      setProcessing(false);
      closeConfirm();
      resetSuccessAnimation();
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View
        className="flex-row items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-neutral-800"
        accessibilityLabel={`${item.product.nombre}, cantidad ${item.quantity}, precio ${item.unitPrice}`}
      >
        <View className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-200 dark:bg-neutral-700">
          {item.product.imagen?.trim() ? (
            <Image
              source={{ uri: item.product.imagen }}
              className="h-full w-full"
              contentFit="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <IconSymbol name="photo.fill" size={28} color="#9ca3af" />
            </View>
          )}
        </View>
        <View className="min-w-0 flex-1 shrink justify-center gap-0.5 pr-2">
          <Text
            className="text-sm font-medium text-gray-900 dark:text-white"
            style={{ fontFamily: AppFonts.bodyStrong }}
            numberOfLines={2}
          >
            {item.product.nombre}
          </Text>
          <Text
            className="text-sm font-semibold text-orange-600"
            style={{ fontFamily: AppFonts.heading }}
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
    ),
    [handleMinus, updateQuantity]
  );

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-4 py-16">
        <EmptyState
          icon="cart"
          title={Strings.ventas.emptyCart}
          description={Strings.ventas.emptyCartHint}
          iconColor="#9ca3af"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 flex-col">
      <Animated.View style={{ flex: 1, opacity: listOpacity }}>
        <FlashList
          data={items}
          keyExtractor={(item: CartItem) => item.productId}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          scrollEnabled={!isClearing}
        />
      </Animated.View>

      <ConfirmAlert
        visible={!!deleteConfirmItem}
        title={Strings.ventas.removeFromCart}
        message={deleteConfirmItem ? `¿Quitar "${deleteConfirmItem.nombre}" del carrito?` : ""}
        confirmText={Strings.common.delete}
        cancelText={Strings.common.cancel}
        onConfirm={handleConfirmRemove}
        onCancel={closeDeleteConfirm}
        danger
      />

      <ConfirmAlert
        visible={confirmVisible}
        title={Strings.ventas.completeSale}
        message={Strings.ventas.confirmComplete}
        confirmText={Strings.ventas.accept}
        cancelText={Strings.common.cancel}
        onConfirm={handleCompleteVenta}
        onCancel={closeConfirm}
        danger={false}
      />

      <ConfirmAlert
        visible={clearCartConfirmVisible}
        title={Strings.ventas.clearCartTitle}
        message={Strings.ventas.confirmClear}
        confirmText={Strings.common.empty}
        cancelText={Strings.common.cancel}
        onConfirm={handleConfirmClearCart}
        onCancel={handleCancelClearCart}
        danger
      />

      <View className="border-t border-gray-200 bg-white px-3 pt-3 pb-2 dark:border-neutral-800 dark:bg-neutral-900">
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 4,
              right: 4,
              zIndex: 10,
              opacity: successOpacity,
              transform: [{ scale: successScale }],
            },
          ]}
        >
          <View className="items-center justify-center rounded-full bg-green-500 p-2">
            <IconSymbol name="checkmark" size={24} color="#ffffff" />
          </View>
        </Animated.View>

        <View className="mb-2.5 flex-row items-center justify-between px-1">
          <Text
            className="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            Total
          </Text>
          <Text
            className="text-xl font-bold text-orange-600"
            style={{ fontFamily: AppFonts.display, letterSpacing: 0.4 }}
          >
            ${total.toLocaleString()}
          </Text>
        </View>

        {isDesktop && (canUndo || canRedo) && (
          <View className="mb-2 flex-row items-center justify-center gap-2">
            <TouchableOpacity
              onPress={undo}
              disabled={!canUndo}
              className={`flex-row items-center gap-1.5 rounded-lg px-3 py-2 ${canUndo ? "bg-gray-100 dark:bg-neutral-800" : "opacity-40"}`}
              accessibilityRole="button"
              accessibilityLabel="Deshacer"
              accessibilityHint="Revertir el último cambio en el carrito"
              accessibilityState={{ disabled: !canUndo }}
            >
              <IconSymbol
                name="arrow.uturn.backward"
                size={16}
                color={canUndo ? "#f97316" : "#9ca3af"}
              />
              <Text
                className={`text-sm font-medium ${canUndo ? "text-orange-600 dark:text-orange-400" : "text-gray-400"}`}
                style={{ fontFamily: AppFonts.bodyStrong }}
              >
                Deshacer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={redo}
              disabled={!canRedo}
              className={`flex-row items-center gap-1.5 rounded-lg px-3 py-2 ${canRedo ? "bg-gray-100 dark:bg-neutral-800" : "opacity-40"}`}
              accessibilityRole="button"
              accessibilityLabel="Rehacer"
              accessibilityHint="Restaurar el cambio revertido"
              accessibilityState={{ disabled: !canRedo }}
            >
              <IconSymbol
                name="arrow.uturn.backward"
                size={16}
                color={canRedo ? "#f97316" : "#9ca3af"}
              />
              <Text
                className={`text-sm font-medium ${canRedo ? "text-orange-600 dark:text-orange-400" : "text-gray-400"}`}
                style={{ fontFamily: AppFonts.bodyStrong }}
              >
                Rehacer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          className="items-center justify-center rounded-2xl bg-orange-500 py-3.5 active:opacity-90"
          activeOpacity={0.9}
          onPress={openConfirm}
          disabled={processing || isClearing}
          style={processing || isClearing ? { opacity: 0.6 } : undefined}
          accessibilityRole="button"
          accessibilityLabel="Completar venta"
          accessibilityHint="Confirma y registra la venta actual"
          accessibilityState={{ disabled: processing || isClearing }}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              className="text-base font-semibold tracking-tight text-white"
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              {Strings.ventas.completeSale}
            </Text>
          )}
        </TouchableOpacity>

        {isDesktop && (
          <TouchableOpacity
            className="mt-2 flex-row items-center justify-center gap-1.5 rounded-2xl border border-orange-500/40 py-3 active:opacity-90"
            activeOpacity={0.85}
            onPress={handleClearCartPress}
            disabled={processing || isClearing}
            accessibilityRole="button"
            accessibilityLabel="Limpiar carrito"
            accessibilityHint="Vacía todos los productos del carrito"
          >
            <Text
              className="text-sm font-semibold text-orange-600 dark:text-orange-400"
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              {Strings.ventas.clearCart}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
