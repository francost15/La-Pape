import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useHaptic } from "@/hooks/use-haptic";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { IconSymbol } from "../../ui/icon-symbol";

interface SuccessActionsProps {
  isDark: boolean;
  onContinuar: () => void;
  onDescargarRecibo?: () => void;
  onEnviarRecibo?: () => void;
}

export function SuccessActions({
  isDark,
  onContinuar,
  onDescargarRecibo,
  onEnviarRecibo,
}: SuccessActionsProps) {
  const haptic = useHaptic();
  const reduceMotion = useReducedMotion();

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
        onPress={onContinuar}
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
  );
}
