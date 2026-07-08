import { useThemeColors } from "@/hooks/use-theme-colors";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { formatCurrency } from "@/lib/utils/format";
import type { VentaCompletada } from "@/store/checkout-store";
import { useHaptic } from "@/hooks/use-haptic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import React from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";

import { IconSymbol } from "../ui/icon-symbol";

interface VentaExitosaModalProps {
  visible: boolean;
  venta: VentaCompletada;
  onClose: () => void;
  onDescargarRecibo?: () => void;
  onEnviarRecibo?: () => void;
}

/**
 * VentaExitosaModal — Digital Atelier style.
 * Cleaner surface, navy dark mode, accent success icon.
 */
export default function VentaExitosaModal({
  visible,
  venta,
  onClose,
  onDescargarRecibo,
  onEnviarRecibo,
}: VentaExitosaModalProps) {
  const { isDark, colors } = useThemeColors();
  const haptic = useHaptic();
  const reduceMotion = useReducedMotion();

  const handleClose = () => {
    haptic();
    onClose();
  };

  // ── Feedback de escala al presionar los botones de recibo ──────────────
  const descargarScale = useSharedValue(1);
  const enviarScale = useSharedValue(1);
  const descargarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: descargarScale.value }],
  }));
  const enviarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enviarScale.value }],
  }));

  const handlePressIn = (scale: SharedValue<number>) => {
    if (reduceMotion) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400, mass: 0.5 });
  };
  const handlePressOut = (scale: SharedValue<number>) => {
    if (reduceMotion) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 400, mass: 0.5 });
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.35)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
        onPress={handleClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: Platform.OS === "web" ? 420 : 340,
            backgroundColor: colors.surface,
            borderRadius: 20,
            overflow: "hidden",
            ...(Platform.OS === "web"
              ? {
                  boxShadow: isDark
                    ? "0 12px 40px rgba(0,0,0,0.5)"
                    : "0 12px 40px rgba(0,0,0,0.12)",
                }
              : {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.5 : 0.12,
                  shadowRadius: 24,
                  elevation: 16,
                }),
          }}
        >
          {/* Header */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 36,
              paddingBottom: 28,
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "rgba(22,163,74,0.1)", // success @ 10% — halo del ícono
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <IconSymbol name="checkmark.circle.fill" size={48} color={AppColors.success} />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: colors.textPrimary,
                letterSpacing: -0.4,
                fontFamily: AppFonts.heading,
              }}
            >
              ¡Venta Exitosa!
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "400",
                color: colors.textSecondary,
                marginTop: 6,
                fontFamily: AppFonts.body,
              }}
            >
              La venta se completó correctamente
            </Text>
          </View>

          {/* Details */}
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: isDark ? AppColors.dark.surfaceElevated : "#F8F8F7",
              borderRadius: 14,
              paddingHorizontal: 16,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 14,
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{ fontSize: 14, color: colors.textSecondary, fontFamily: AppFonts.body }}
              >
                Fecha
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.textPrimary,
                  fontFamily: AppFonts.bodyStrong,
                }}
              >
                {venta.fecha}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 18,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.textPrimary,
                  fontFamily: AppFonts.bodyStrong,
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: isDark ? AppColors.primaryLight : AppColors.primary,
                  fontFamily: AppFonts.display,
                  letterSpacing: -0.5,
                }}
              >
                {formatCurrency(venta.total)}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={{ padding: 20, gap: 10 }}>
            <Animated.View style={descargarStyle}>
              <Pressable
                onPress={() => {
                  haptic();
                  onDescargarRecibo?.();
                }}
                onPressIn={() => handlePressIn(descargarScale)}
                onPressOut={() => handlePressOut(descargarScale)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 15,
                  borderRadius: 14,
                  backgroundColor: AppColors.primary,
                }}
              >
                <IconSymbol name="square.and.arrow.down" size={18} color="#fff" />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#fff",
                    fontFamily: AppFonts.bodyStrong,
                    letterSpacing: -0.2,
                  }}
                >
                  Descargar Recibo
                </Text>
              </Pressable>
            </Animated.View>

            {onEnviarRecibo && (
              <Animated.View style={enviarStyle}>
                <Pressable
                  onPress={() => {
                    haptic();
                    onEnviarRecibo();
                  }}
                  onPressIn={() => handlePressIn(enviarScale)}
                  onPressOut={() => handlePressOut(enviarScale)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 15,
                    borderRadius: 14,
                    backgroundColor: AppColors.success,
                  }}
                >
                  <IconSymbol name="paperplane.fill" size={16} color="#fff" />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: "#fff",
                      fontFamily: AppFonts.bodyStrong,
                      letterSpacing: -0.2,
                    }}
                  >
                    Enviar Recibo
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            <TouchableOpacity
              onPress={handleClose}
              style={{
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isDark ? AppColors.infoLight : AppColors.info,
                  fontFamily: AppFonts.bodyStrong,
                }}
              >
                Continuar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Close button */}
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isDark
                ? AppColors.dark.surfaceElevated
                : AppColors.light.surfaceHover,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSymbol name="xmark" size={12} color={colors.textMuted} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
