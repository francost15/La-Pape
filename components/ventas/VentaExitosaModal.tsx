import { AppColors } from "@/constants/colors";
import { useHaptic } from "@/hooks/use-haptic";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { VentaExitosaModalProps } from "@/interface/ventas";
import { Modal, Platform, Pressable, TouchableOpacity } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import { SuccessActions } from "./venta-exitosa/SuccessActions";
import { SuccessDetails } from "./venta-exitosa/SuccessDetails";
import { SuccessHeader } from "./venta-exitosa/SuccessHeader";

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

  const handleClose = () => {
    haptic();
    onClose();
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
          <SuccessHeader colors={colors} />

          <SuccessDetails venta={venta} isDark={isDark} colors={colors} />

          <SuccessActions
            isDark={isDark}
            colors={colors}
            onContinuar={handleClose}
            onDescargarRecibo={onDescargarRecibo}
            onEnviarRecibo={onEnviarRecibo}
          />

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
