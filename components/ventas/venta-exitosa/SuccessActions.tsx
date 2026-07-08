import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useHaptic } from "@/hooks/use-haptic";
import { usePressScaleHandlers } from "@/hooks/use-press-scale";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { SuccessActionsProps } from "@/interface/ventas";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { IconSymbol } from "../../ui/icon-symbol";

export function SuccessActions({
  isDark,
  colors,
  onContinuar,
  onDescargarRecibo,
  onEnviarRecibo,
}: SuccessActionsProps) {
  const haptic = useHaptic();
  const reduceMotion = useReducedMotion();
  const { onPressIn, onPressOut } = usePressScaleHandlers(reduceMotion);

  const descargarScale = useSharedValue(1);
  const enviarScale = useSharedValue(1);
  const descargarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: descargarScale.value }],
  }));
  const enviarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: enviarScale.value }],
  }));

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Animated.View style={descargarStyle}>
        <Pressable
          onPress={() => {
            haptic();
            onDescargarRecibo?.();
          }}
          onPressIn={() => onPressIn(descargarScale)}
          onPressOut={() => onPressOut(descargarScale)}
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
            onPressIn={() => onPressIn(enviarScale)}
            onPressOut={() => onPressOut(enviarScale)}
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
        onPress={onContinuar}
        style={{
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
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
  );
}
