import type { CenteredModalProps } from "@/interface/ui";
import { shadow } from "@/lib/utils/shadows";
import React from "react";
import { Modal, Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion, ZoomIn, ZoomOut } from "react-native-reanimated";

/**
 * CenteredModal — diálogo centrado con zoom (variante desktop).
 *
 * Extraído del `DesktopModal` de PeriodFilter. Complementa a
 * [BottomSheetModal] para pantallas anchas. El contenido maneja su scroll.
 */
export function CenteredModal({
  visible,
  onClose,
  children,
  maxHeight = 560,
  closeLabel = "Cerrar",
}: CenteredModalProps) {
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
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <Pressable
          className="absolute top-0 right-0 bottom-0 left-0"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <Animated.View
          entering={ZoomIn.duration(250).springify().damping(18).reduceMotion(ReduceMotion.System)}
          exiting={ZoomOut.duration(150).reduceMotion(ReduceMotion.System)}
          className="w-full max-w-md"
        >
          <View
            className="mx-4 overflow-hidden rounded-3xl bg-surface-elevated"
            style={[{ maxHeight }, shadow("0 24px 48px rgba(0,0,0,0.2)", 24)]}
          >
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
