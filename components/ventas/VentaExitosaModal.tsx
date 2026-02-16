import type { VentaCompletada } from "@/store/checkout-store";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

interface VentaExitosaModalProps {
  visible: boolean;
  venta: VentaCompletada;
  onClose: () => void;
  onDescargarRecibo?: () => void;
  onEnviarRecibo?: () => void;
}

export default function VentaExitosaModal({
  visible,
  venta,
  onClose,
  onDescargarRecibo,
  onEnviarRecibo,
}: VentaExitosaModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleClose = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const bgCard = isDark ? "#262626" : "#ffffff";
  const borderColor = isDark ? "#404040" : "#e5e7eb";
  const labelColor = isDark ? "#a3a3a3" : "#6b7280";
  const valueColor = isDark ? "#fafafa" : "#111827";
  const secondaryBg = isDark ? "#404040" : "#f3f4f6";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
        onPress={handleClose}
      >
        <Pressable
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: bgCard,
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#dcfce7",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={26}
                  color="#16a34a"
                />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#16a34a",
                }}
              >
                ¡Venta Exitosa!
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: secondaryBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="xmark" size={18} color={labelColor} />
            </TouchableOpacity>
          </View>

          {/* Detalles */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              gap: 14,
              borderTopWidth: 1,
              borderTopColor: borderColor,
            }}
          >
            <Row label="ID de venta" value={venta.id} valueColor={valueColor} labelColor={labelColor} />
            <Row label="Fecha" value={venta.fecha} valueColor={valueColor} labelColor={labelColor} />
            <Row
              label="Total"
              value={`$${venta.total.toLocaleString()}`}
              valueColor="#ea580c"
              valueBold
              labelColor={labelColor}
            />
          </View>

          {/* Botones */}
          <View
            style={{
              padding: 20,
              paddingTop: 8,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onDescargarRecibo?.();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "#ea580c",
                paddingVertical: 14,
                borderRadius: 12,
              }}
              activeOpacity={0.85}
            >
              <IconSymbol name="square.and.arrow.down" size={22} color="#fff" />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
                Descargar Recibo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onEnviarRecibo?.();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "#16a34a",
                paddingVertical: 14,
                borderRadius: 12,
              }}
              activeOpacity={0.85}
            >
              <IconSymbol name="paperplane.fill" size={20} color="#fff" />
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}>
                Enviar Recibo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              style={{
                backgroundColor: secondaryBg,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
              activeOpacity={0.85}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: labelColor,
                }}
              >
                Ahora no
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Row({
  label,
  value,
  labelColor,
  valueColor,
  valueBold,
}: {
  label: string;
  value: string;
  labelColor: string;
  valueColor: string;
  valueBold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 15, color: labelColor }}>{label}</Text>
      <Text
        style={{
          fontSize: 15,
          color: valueColor,
          fontWeight: valueBold ? "700" : "500",
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}
