import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface ConfirmAlertProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

/**
 * ConfirmAlert — Digital Atelier style.
 *
 * Minimalist alert dialog with premium typography and flat surfaces.
 * Navy dark mode and Stone light mode.
 */
export default function ConfirmAlert({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmAlertProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  const colors = isDark ? AppColors.dark : AppColors.light;
  const overlayBg = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      accessibilityViewIsModal
    >
      <View style={styles.container}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayBg }]} />
        <Pressable style={styles.pressable} onPress={onCancel}>
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 1.5,
                borderColor: colors.border,
                ...(Platform.OS === "web"
                  ? { boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.12)" }
                  : { elevation: 10 }),
              },
            ]}
            onPress={() => {}}
          >
            <View style={{ padding: 24, paddingBottom: 20 }}>
              <Text
                style={{
                  fontSize: 19,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  marginBottom: 8,
                  fontFamily: AppFonts.heading,
                  letterSpacing: -0.4,
                }}
                accessibilityRole="header"
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 22,
                  color: colors.textSecondary,
                  fontFamily: AppFonts.body,
                }}
              >
                {message}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <TouchableOpacity
                onPress={onCancel}
                style={{
                  flex: 1,
                  paddingVertical: 18,
                  alignItems: "center",
                  borderRightWidth: 1,
                  borderRightColor: colors.border,
                }}
                accessibilityRole="button"
                accessibilityLabel={cancelText}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: colors.textSecondary,
                    fontFamily: AppFonts.bodyStrong,
                  }}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                style={{ flex: 1, paddingVertical: 18, alignItems: "center" }}
                accessibilityRole="button"
                accessibilityLabel={confirmText}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: danger ? "#f43f5e" : "#ea580c",
                    fontFamily: AppFonts.bodyStrong,
                  }}
                >
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
  },
});
