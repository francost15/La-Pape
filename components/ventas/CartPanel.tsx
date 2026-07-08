import { DesignSystem, DESKTOP_MIN_WIDTH } from "@/constants/design-system";
import { Strings } from "@/constants/strings";
import { useCompleteVenta } from "@/hooks/use-complete-venta";
import { useHaptic } from "@/hooks/use-haptic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { notify } from "@/lib/notify";
import { useCheckoutStore } from "@/store/checkout-store";
import type { CartItem } from "@/interface/ventas";
import { useVentasStore } from "@/store/ventas-store";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import EmptyState from "../ui/EmptyState";
import { CartConfirmDialogs } from "./cart/CartConfirmDialogs";
import { CartFooter } from "./cart/CartFooter";
import { CartItemRow } from "./cart/CartItemRow";

export default function CartPanel() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN_WIDTH;
  const { isDark, colors } = useThemeColors();

  const items = useVentasStore((s) => s.items);
  const removeItem = useVentasStore((s) => s.removeItem);
  const updateQuantity = useVentasStore((s) => s.updateQuantity);
  const getTotal = useVentasStore((s) => s.getTotal);
  const clearCart = useVentasStore((s) => s.clearCart);

  const confirmVisible = useCheckoutStore((s) => s.confirmVisible);
  const processing = useCheckoutStore((s) => s.processing);
  const openConfirm = useCheckoutStore((s) => s.openConfirm);
  const closeConfirm = useCheckoutStore((s) => s.closeConfirm);

  const deleteConfirmItem = useVentasUIStore((s) => s.deleteConfirmItem);
  const openDeleteConfirm = useVentasUIStore((s) => s.openDeleteConfirm);
  const closeDeleteConfirm = useVentasUIStore((s) => s.closeDeleteConfirm);

  const haptic = useHaptic();
  const reduceMotion = useReducedMotion();
  const [clearCartConfirmVisible, setClearCartConfirmVisible] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const total = getTotal();

  // ── Animación de éxito ────────────────────────────────────────────────
  // Valor inicial 0.5 (no 0): desde scale(0) el check se "teletransporta" al
  // aparecer; partiendo de 0.5 el pop del spring se lee como una escala, no
  // como algo que surge de la nada.
  const successScale = useSharedValue(0.5);
  const successOpacity = useSharedValue(0);
  const listOpacity = useSharedValue(1);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimeoutRef.current), []);

  const playSuccessAnimation = useCallback(() => {
    successOpacity.value = withTiming(1, { duration: DesignSystem.animations.fast });
    // Reduced motion: mostramos el check solo con opacidad, sin el pop del spring.
    if (reduceMotion) {
      successScale.value = 1;
      return;
    }
    successScale.value = withSequence(
      withSpring(1.2, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 350 })
    );
  }, [successOpacity, successScale, reduceMotion]);

  const resetSuccessAnimation = useCallback(() => {
    successScale.value = 0.5;
    successOpacity.value = 0;
  }, [successScale, successOpacity]);

  const { completeVenta } = useCompleteVenta(() => {
    playSuccessAnimation();
    clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(resetSuccessAnimation, 800);
  });

  // ── Limpiar carrito ───────────────────────────────────────────────────
  const handleClearCartPress = useCallback(() => {
    haptic();
    setClearCartConfirmVisible(true);
  }, [haptic]);

  const handleConfirmClearCart = useCallback(() => {
    setIsClearing(true);
    listOpacity.value = withTiming(0, { duration: DesignSystem.animations.normal });
    setTimeout(() => {
      clearCart();
      setIsClearing(false);
      listOpacity.value = 1;
      notify.info({ title: Strings.ventas.cartEmptied });
    }, DesignSystem.animations.normal + 100);
    setClearCartConfirmVisible(false);
  }, [clearCart, listOpacity]);

  const handleCancelClearCart = useCallback(() => {
    listOpacity.value = withSpring(1, { damping: 10, stiffness: 200 });
    setIsClearing(false);
    setClearCartConfirmVisible(false);
  }, [listOpacity]);

  // ── Eliminar ítem ─────────────────────────────────────────────────────
  const handleMinus = useCallback(
    (item: CartItem) => {
      if (item.quantity === 1) {
        openDeleteConfirm({ productId: item.productId, nombre: item.product.nombre });
      } else {
        updateQuantity(item.productId, item.quantity - 1);
      }
    },
    [openDeleteConfirm, updateQuantity]
  );

  const handleConfirmRemove = useCallback(() => {
    if (deleteConfirmItem) {
      removeItem(deleteConfirmItem.productId);
      notify.warning({ title: `${deleteConfirmItem.nombre} eliminado del carrito` });
      closeDeleteConfirm();
    }
  }, [deleteConfirmItem, removeItem, closeDeleteConfirm]);

  const handlePlus = useCallback(
    (item: CartItem) => updateQuantity(item.productId, item.quantity + 1),
    [updateQuantity]
  );

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemRow
        item={item}
        isDark={isDark}
        colors={colors}
        onMinus={handleMinus}
        onPlus={handlePlus}
      />
    ),
    [isDark, colors, handleMinus, handlePlus]
  );

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <EmptyState
          icon="cart"
          title={Strings.ventas.emptyCart}
          description={Strings.ventas.emptyCartHint}
          iconColor={colors.textMuted}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: "column" }}>
      <Animated.View style={{ flex: 1, opacity: listOpacity }}>
        <FlashList
          data={items}
          keyExtractor={(item: CartItem) => item.productId}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          scrollEnabled={!isClearing}
        />
      </Animated.View>

      <CartConfirmDialogs
        deleteConfirmItem={deleteConfirmItem}
        confirmVisible={confirmVisible}
        clearCartConfirmVisible={clearCartConfirmVisible}
        onConfirmRemove={handleConfirmRemove}
        onCancelRemove={closeDeleteConfirm}
        onCompleteVenta={completeVenta}
        onCancelComplete={closeConfirm}
        onConfirmClear={handleConfirmClearCart}
        onCancelClear={handleCancelClearCart}
      />

      <CartFooter
        total={total}
        colors={colors}
        isDesktop={isDesktop}
        processing={processing}
        isClearing={isClearing}
        reduceMotion={reduceMotion}
        successOpacity={successOpacity}
        successScale={successScale}
        onComplete={openConfirm}
        onClearCart={handleClearCartPress}
      />
    </View>
  );
}
