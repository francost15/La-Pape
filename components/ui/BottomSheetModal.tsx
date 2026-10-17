import type { BottomSheetModalProps } from "@/interface/ui";
import React from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";

/**
 * BottomSheetModal — sheet mobile que sube desde abajo.
 *
 * Extraído del `MobileModal` de PeriodFilter (la versión más pulida): backdrop
 * con fade, sheet con spring, grab handle y respeto de reduced-motion. El
 * contenido maneja su propio scroll/padding (envuélvelo en un ScrollView si es
 * alto). Unifica los 4 shells de bottom-sheet que había repartidos.
 */
export function BottomSheetModal({
  visible,
  onClose,
  children,
  maxHeight = 560,
  closeLabel = "Cerrar",
}: BottomSheetModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      <Animated.View
        entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
        exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <Animated.View
          entering={SlideInDown.springify()
            .damping(20)
            .stiffness(180)
            .reduceMotion(ReduceMotion.System)}
          exiting={SlideOutDown.duration(200).reduceMotion(ReduceMotion.System)}
        >
          <View className="rounded-t-3xl bg-surface-elevated" style={{ maxHeight }}>
            <View className="mt-3 mb-1 h-1 w-10 self-center rounded-full bg-line-strong" />
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
