import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  Modal,
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
  const cardBg = colorScheme === "dark" ? "#262626" : "#ffffff";
  const borderColor = colorScheme === "dark" ? "#404040" : "#e5e7eb";
  const titleColor = colorScheme === "dark" ? "#fafafa" : "#111827";
  const messageColor = colorScheme === "dark" ? "#a3a3a3" : "#4b5563";
  const cancelColor = colorScheme === "dark" ? "#d4d4d4" : "#4b5563";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
        <Pressable style={styles.pressable} onPress={onCancel}>
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor,
              },
            ]}
            onPress={() => {}}
          >
            <View style={{ padding: 20, paddingBottom: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: titleColor,
                  marginBottom: 4,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: messageColor,
                }}
              >
                {message}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                borderTopWidth: 1,
                borderTopColor: borderColor,
              }}
            >
              <TouchableOpacity
                onPress={onCancel}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  alignItems: "center",
                  borderRightWidth: 1,
                  borderRightColor: borderColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: cancelColor,
                  }}
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                style={{ flex: 1, paddingVertical: 16, alignItems: "center" }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: danger ? "#dc2626" : "#ea580c",
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
  overlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  pressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
  },
});

