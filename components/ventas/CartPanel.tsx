import { notify } from "@/lib/notify";
import { formatCurrency } from "@/lib/utils/format";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { DesignSystem, DESKTOP_MIN_WIDTH } from "@/constants/design-system";
import { Strings } from "@/constants/strings";
import { useCompleteVenta } from "@/hooks/use-complete-venta";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useCheckoutStore } from "@/store/checkout-store";
import { useVentasStore } from "@/store/ventas-store";
import { useVentasUIStore } from "@/store/ventas-ui-store";
import { useHaptic } from "@/hooks/use-haptic";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
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
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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

  // ── Feedback de escala del CTA "Completar venta" ──────────────────────
  const ctaScale = useSharedValue(1);
  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  const handleCtaPressIn = useCallback(() => {
    if (reduceMotion) return;
    ctaScale.value = withSpring(0.97, { damping: 15, stiffness: 400, mass: 0.5 });
  }, [ctaScale, reduceMotion]);

  const handleCtaPressOut = useCallback(() => {
    if (reduceMotion) return;
    ctaScale.value = withSpring(1, { damping: 15, stiffness: 400, mass: 0.5 });
  }, [ctaScale, reduceMotion]);

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

  // ── Render de ítem ────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}
        accessibilityLabel={`${item.product.nombre}, cantidad ${item.quantity}, precio ${formatCurrency(item.unitPrice)}`}
      >
        <View
          style={{
            height: 64,
            width: 64,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: isDark ? AppColors.dark.surfaceElevated : AppColors.light.surfaceHover,
            flexShrink: 0,
            ...(Platform.OS === "web" ? { boxShadow: "0 4px 12px rgba(0,0,0,0.03)" } : {}),
          }}
        >
          {item.product.imagen?.trim() ? (
            <Image
              source={{ uri: item.product.imagen }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <IconSymbol name="photo.fill" size={24} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={{ flex: 1, minWidth: 0, justifyContent: "center", gap: 2 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: colors.textPrimary,
              fontFamily: AppFonts.bodyStrong,
              lineHeight: 20,
            }}
            numberOfLines={2}
          >
            {item.product.nombre}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              fontFamily: AppFonts.body,
            }}
            numberOfLines={1}
          >
            {formatCurrency(item.unitPrice)} cada uno
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: colors.textPrimary,
              fontFamily: AppFonts.bodyStrong,
            }}
          >
            {formatCurrency(item.unitPrice * item.quantity)}
          </Text>
          <QuantityStepper
            quantity={item.quantity}
            onMinus={() => handleMinus(item)}
            onPlus={() => updateQuantity(item.productId, item.quantity + 1)}
          />
        </View>
      </View>
    ),
    [isDark, colors, handleMinus, updateQuantity]
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

      {/* ── Diálogos de confirmación ──────────────────────────────────── */}
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
        onConfirm={completeVenta}
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

      {/* ── Footer: total + acciones ──────────────────────────────────── */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 32,
          borderTopWidth: 1.5,
          borderTopColor: colors.border,
        }}
      >
        {/* Checkmark animado de éxito */}
        <Animated.View
          style={{
            position: "absolute",
            top: -24,
            right: 24,
            zIndex: 10,
            opacity: successOpacity,
            transform: [{ scale: successScale }],
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9999,
              backgroundColor: AppColors.success,
              padding: 16,
              ...(Platform.OS === "web" ? { boxShadow: "0 12px 24px rgba(34, 197, 94, 0.3)" } : {}),
            }}
          >
            <IconSymbol name="checkmark" size={32} color="#ffffff" />
          </View>
        </Animated.View>

        {/* Total */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
              color: colors.textMuted,
              fontFamily: AppFonts.bodyStrong,
              marginBottom: 4,
            }}
          >
            TOTAL A PAGAR
          </Text>
          <Text
            style={{
              fontSize: 48,
              color: AppColors.primary,
              fontFamily: AppFonts.display,
              letterSpacing: -1,
              lineHeight: 54,
            }}
          >
            {formatCurrency(total)}
          </Text>
        </View>

        {/* Botones */}
        <View style={{ gap: 12 }}>
          <Animated.View style={ctaAnimatedStyle}>
            <Pressable
              onPress={openConfirm}
              onPressIn={handleCtaPressIn}
              onPressOut={handleCtaPressOut}
              disabled={processing || isClearing}
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: DesignSystem.radius.xxl,
                paddingVertical: 20,
                backgroundColor: AppColors.primary,
                opacity: processing || isClearing ? 0.6 : 1,
                ...(Platform.OS === "web"
                  ? { boxShadow: "0 12px 24px rgba(234, 88, 12, 0.2)" }
                  : {}),
              }}
              accessibilityRole="button"
              accessibilityLabel="Completar venta"
              accessibilityHint="Procesa el pago y registra la venta"
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    letterSpacing: 1.5,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    fontFamily: AppFonts.bodyStrong,
                  }}
                >
                  {Strings.ventas.completeSale}
                </Text>
              )}
            </Pressable>
          </Animated.View>

          {isDesktop && (
            <TouchableOpacity
              onPress={handleClearCartPress}
              disabled={processing || isClearing}
              activeOpacity={0.85}
              style={{
                alignItems: "center",
                justifyContent: "center",
                borderRadius: DesignSystem.radius.xxl,
                paddingVertical: 16,
                marginTop: 4,
                borderWidth: 1.5,
                borderColor: AppColors.primaryGhost,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: AppColors.primary,
                  fontFamily: AppFonts.bodyStrong,
                }}
              >
                {Strings.ventas.clearCart}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
