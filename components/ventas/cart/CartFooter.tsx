import { AppColors } from "@/constants/colors";
import { DesignSystem } from "@/constants/design-system";
import { Strings } from "@/constants/strings";
import { AppFonts } from "@/constants/typography";
import type { ThemeColors } from "@/hooks/use-theme-colors";
import { formatCurrency } from "@/lib/utils/format";
import { useCallback } from "react";
import { ActivityIndicator, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { IconSymbol } from "../../ui/icon-symbol";

interface CartFooterProps {
  total: number;
  colors: ThemeColors;
  isDesktop: boolean;
  processing: boolean;
  isClearing: boolean;
  reduceMotion: boolean;
  successOpacity: SharedValue<number>;
  successScale: SharedValue<number>;
  onComplete: () => void;
  onClearCart: () => void;
}

export function CartFooter({
  total,
  colors,
  isDesktop,
  processing,
  isClearing,
  reduceMotion,
  successOpacity,
  successScale,
  onComplete,
  onClearCart,
}: CartFooterProps) {
  // Feedback de escala del CTA "Completar venta" (concern exclusivo del footer).
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

  return (
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
            onPress={onComplete}
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
              ...(Platform.OS === "web" ? { boxShadow: "0 12px 24px rgba(234, 88, 12, 0.2)" } : {}),
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
            onPress={onClearCart}
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
  );
}
