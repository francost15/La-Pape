import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useHaptic } from "@/hooks/use-haptic";
import { usePressScale } from "@/hooks/use-press-scale";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { SuccessActionsProps } from "@/interface/ventas";
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { IconSymbol } from "../../ui/icon-symbol";

export function SuccessActions({
  isDark,
  colors,
  onContinuar,
  onDescargarRecibo,
}: SuccessActionsProps) {
  const haptic = useHaptic();
  const reduceMotion = useReducedMotion();
  const descargar = usePressScale(reduceMotion);

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Animated.View style={descargar.animatedStyle}>
        <Pressable
          onPress={() => {
            haptic();
            onDescargarRecibo?.();
          }}
          onPressIn={descargar.onPressIn}
          onPressOut={descargar.onPressOut}
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
              color: "#fff",
              fontFamily: AppFonts.bodyStrong,
              letterSpacing: -0.2,
              // En native el peso va codificado en el archivo de fuente; un
              // fontWeight explícito fuerza bold sintético. En web sí se declara.
              ...(Platform.OS === "web" ? { fontWeight: "700" as const } : null),
            }}
          >
            Descargar Recibo
          </Text>
        </Pressable>
      </Animated.View>

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
            color: isDark ? AppColors.infoLight : AppColors.info,
            fontFamily: AppFonts.bodyStrong,
            ...(Platform.OS === "web" ? { fontWeight: "600" as const } : null),
          }}
        >
          Continuar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
