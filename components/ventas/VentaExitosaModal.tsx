import { useColorScheme } from "@/hooks/use-color-scheme";
import type { VentaCompletada } from "@/store/checkout-store";
import * as Haptics from "expo-haptics";
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

import { IconSymbol } from "../ui/icon-symbol";

const SUCCESS_GREEN = "#34C759";
const ORANGE_PRIMARY = "#ea580c";
const TOTAL_HIGHLIGHT = "#f97316";

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
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const styles = useStyles(isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header con ícono de éxito */}
          <View style={styles.header}>
            <View style={styles.successBadge}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={56}
                color={SUCCESS_GREEN}
              />
            </View>
            <Text style={styles.title}>¡Venta Exitosa!</Text>
            <Text style={styles.subtitle}>
              La venta se completó correctamente
            </Text>
          </View>

          {/* Grupo tipo Settings de Apple */}
          <View style={styles.detailsGroup}>
            <DetailRow
              label="Fecha"
              value={venta.fecha}
              isLast={false}
              labelColor={styles.labelColor}
              valueColor={styles.valueColor}
              dividerColor={styles.dividerColor}
              rowStyle={styles.rowStyle}
              labelStyle={styles.labelStyle}
              valueStyle={styles.valueStyle}
            />
            <DetailRow
              label="Total"
              value={`$${venta.total.toLocaleString()}`}
              isLast
              valueBold
              valueHighlight
              valueLarge
              labelColor={styles.labelColor}
              valueColor={styles.valueColor}
              dividerColor={styles.dividerColor}
              rowStyle={[styles.rowStyle, styles.rowTotal]}
              labelStyle={styles.labelStyle}
              valueStyle={styles.valueStyle}
            />
          </View>

          {/* Acciones */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onDescargarRecibo?.();
              }}
              style={[styles.button, styles.buttonPrimary]}
              activeOpacity={0.85}
            >
              <IconSymbol name="square.and.arrow.down" size={20} color="#fff" />
              <Text style={styles.buttonPrimaryText}>Descargar Recibo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onEnviarRecibo?.();
              }}
              style={[styles.button, styles.buttonSecondary]}
              activeOpacity={0.85}
            >
              <IconSymbol name="paperplane.fill" size={18} color="#fff" />
              <Text style={styles.buttonSecondaryText}>Enviar Recibo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.buttonTertiary}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonTertiaryText}>Continuar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={styles.closeButton}
          >
            <IconSymbol name="xmark" size={14} color={styles.labelColor} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  isLast,
  valueBold,
  valueHighlight,
  valueLarge,
  labelColor,
  valueColor,
  dividerColor,
  rowStyle,
  labelStyle,
  valueStyle,
}: {
  label: string;
  value: string;
  isLast: boolean;
  valueBold?: boolean;
  valueHighlight?: boolean;
  valueLarge?: boolean;
  labelColor: string;
  valueColor: string;
  dividerColor: string;
  rowStyle: object | object[];
  labelStyle: object;
  valueStyle: object;
}) {
  const highlightColor = valueLarge ? TOTAL_HIGHLIGHT : ORANGE_PRIMARY;
  return (
    <>
      <View style={rowStyle}>
        <Text
          style={[
            labelStyle,
            { color: labelColor },
            valueLarge && { fontSize: 16, fontWeight: "600" },
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            valueStyle,
            {
              color: valueHighlight ? highlightColor : valueColor,
              fontSize: valueLarge ? 22 : undefined,
              fontWeight: valueBold || valueLarge ? "700" : undefined,
            },
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
      {!isLast && (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: dividerColor,
          }}
        />
      )}
    </>
  );
}

function useStyles(isDark: boolean) {
  const bgCard = isDark ? "#1C1C1E" : "#FFFFFF";
  const labelColor = isDark ? "#8E8E93" : "#6B7280";
  const valueColor = isDark ? "#F5F5F7" : "#1D1D1F";
  const dividerColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const tertiaryBg = isDark ? "#2C2C2E" : "#F2F2F7";

  return {
    labelColor,
    valueColor,
    backdrop: {
      flex: 1,
      backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.4)",
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    } as const,
    card: {
      width: "100%",
      maxWidth: Platform.OS === "web" ? 480 : 340,
      backgroundColor: bgCard,
      borderRadius: 14,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.5 : 0.12,
          shadowRadius: 24,
        },
        android: { elevation: 16 },
        web: {
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.4)"
            : "0 8px 32px rgba(0,0,0,0.12)",
        },
      }),
    } as const,
    header: {
      alignItems: "center",
      paddingTop: 32,
      paddingBottom: 24,
      paddingHorizontal: 24,
    } as const,
    successBadge: {
      marginBottom: 12,
    } as const,
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: valueColor,
      letterSpacing: -0.4,
    } as const,
    subtitle: {
      fontSize: 15,
      fontWeight: "400",
      color: labelColor,
      marginTop: 4,
      letterSpacing: -0.2,
    } as const,
    detailsGroup: {
      marginHorizontal: 16,
      backgroundColor: tertiaryBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      overflow: "hidden",
    } as const,
    rowStyle: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "center" as const,
      paddingVertical: 14,
    } as const,
    rowTotal: {
      paddingVertical: 18,
    } as const,
    labelStyle: {
      fontSize: 15,
      fontWeight: "400",
      letterSpacing: -0.2,
    } as const,
    valueStyle: {
      fontSize: 15,
      fontWeight: "500",
      letterSpacing: -0.2,
      maxWidth: "60%",
    } as const,
    dividerColor,
    actions: {
      padding: 20,
      paddingTop: 20,
      gap: 10,
    } as const,
    button: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
    } as const,
    buttonPrimary: {
      backgroundColor: ORANGE_PRIMARY,
    } as const,
    buttonPrimaryText: {
      fontSize: 17,
      fontWeight: "600",
      color: "#fff",
      letterSpacing: -0.2,
    } as const,
    buttonSecondary: {
      backgroundColor: SUCCESS_GREEN,
    } as const,
    buttonSecondaryText: {
      fontSize: 17,
      fontWeight: "600",
      color: "#fff",
      letterSpacing: -0.2,
    } as const,
    buttonTertiary: {
      paddingVertical: 14,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    } as const,
    buttonTertiaryText: {
      fontSize: 17,
      fontWeight: "600",
      color: isDark ? "#0A84FF" : "#007AFF",
      letterSpacing: -0.2,
    } as const,
    closeButton: {
      position: "absolute" as const,
      top: 12,
      right: 12,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: tertiaryBg,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    } as const,
  };
}
