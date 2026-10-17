import { AppColors } from "@/constants/colors";
import { METODO_PAGO_LABEL, METODOS_PAGO, parseMonto, type MetodoPago } from "@/constants/pagos";
import { Strings } from "@/constants/strings";
import { AppFonts } from "@/constants/typography";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { formatCurrency } from "@/lib/utils/format";
import { useCheckoutStore } from "@/store/checkout-store";
import { useSessionStore } from "@/store/session-store";
import type { CheckoutDialogProps } from "@/interface/ventas";
import { useVentasStore } from "@/store/ventas-store";
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

function cashChange(esEfectivo: boolean, recibido: number, total: number): number {
  if (!esEfectivo || Number.isNaN(recibido)) return 0;
  return recibido - total;
}

function chipStyle(selected: boolean, isDark: boolean, border: string) {
  return {
    borderColor: selected ? AppColors.primary : border,
    backgroundColor: selected
      ? isDark
        ? AppColors.primaryGhostDark
        : AppColors.primaryGhost
      : "transparent",
  };
}

const METODOS: MetodoPago[] = [
  METODOS_PAGO.EFECTIVO,
  METODOS_PAGO.DEBITO,
  METODOS_PAGO.TRANSFERENCIA,
];

export function CheckoutDialog({ visible, processing, onConfirm, onCancel }: CheckoutDialogProps) {
  const { isDark, colors } = useThemeColors();
  const items = useVentasStore((s) => s.items);
  const total = useVentasStore((s) => s.getTotal());
  const metodoPago = useCheckoutStore((s) => s.metodoPago);
  const montoRecibido = useCheckoutStore((s) => s.montoRecibido);
  const setMetodoPago = useCheckoutStore((s) => s.setMetodoPago);
  const setMontoRecibido = useCheckoutStore((s) => s.setMontoRecibido);
  const negocioNombre = useSessionStore((s) => s.negocioNombre);
  const sucursales = useSessionStore((s) => s.sucursales);
  const sucursalId = useSessionStore((s) => s.sucursalId);
  const sucursalNombre = useSessionStore((s) => s.sucursalNombre);
  const setSucursal = useSessionStore((s) => s.setSucursal);

  const recibido = parseMonto(montoRecibido);
  const esEfectivo = metodoPago === METODOS_PAGO.EFECTIVO;
  const vuelto = cashChange(esEfectivo, recibido, total);
  const faltaEfectivo = esEfectivo && (Number.isNaN(recibido) || vuelto < 0);
  const preview = items.slice(0, 4);
  const resto = items.length - preview.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.container}>
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)" },
          ]}
          onPress={onCancel}
          accessibilityLabel="Cerrar cobro"
        />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: AppFonts.display }]}>
            {Strings.ventas.completeSale}
          </Text>
          <Text
            style={[styles.context, { color: colors.textSecondary, fontFamily: AppFonts.body }]}
          >
            {[negocioNombre, sucursalNombre].filter(Boolean).join(" · ") || "Sin sucursal"}
          </Text>

          {sucursales.length > 1 ? (
            <View style={styles.methods}>
              {sucursales.map((sucursal) => {
                const selected = sucursal.id === sucursalId;
                return (
                  <Pressable
                    key={sucursal.id}
                    onPress={() => setSucursal(sucursal.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={sucursal.nombre}
                    style={[styles.chip, chipStyle(selected, isDark, colors.border)]}
                  >
                    <Text style={{ color: colors.textPrimary, fontFamily: AppFonts.body }}>
                      {sucursal.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View style={styles.lines}>
            {preview.map((item) => (
              <Text
                key={item.productId}
                numberOfLines={1}
                style={{ color: colors.textSecondary, fontFamily: AppFonts.body }}
              >
                {item.quantity} × {item.product.nombre}
              </Text>
            ))}
            {resto > 0 ? (
              <Text style={{ color: colors.textSecondary, fontFamily: AppFonts.body }}>
                y {resto} más
              </Text>
            ) : null}
          </View>

          <Text style={[styles.total, { color: AppColors.primary, fontFamily: AppFonts.display }]}>
            {formatCurrency(total)}
          </Text>

          <View style={styles.methods}>
            {METODOS.map((metodo) => {
              const selected = metodo === metodoPago;
              return (
                <Pressable
                  key={metodo}
                  onPress={() => setMetodoPago(metodo)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={METODO_PAGO_LABEL[metodo]}
                  style={[styles.chip, chipStyle(selected, isDark, colors.border)]}
                >
                  <Text style={{ color: colors.textPrimary, fontFamily: AppFonts.bodyStrong }}>
                    {METODO_PAGO_LABEL[metodo]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {esEfectivo ? (
            <View style={styles.cash}>
              <Text style={{ color: colors.textSecondary, fontFamily: AppFonts.body }}>
                {Strings.ventas.amountReceived}
              </Text>
              <TextInput
                value={montoRecibido}
                onChangeText={setMontoRecibido}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={Strings.ventas.amountReceived}
                style={[
                  styles.input,
                  {
                    color: colors.textPrimary,
                    borderColor: faltaEfectivo && montoRecibido ? AppColors.error : colors.border,
                    fontFamily: AppFonts.body,
                  },
                ]}
              />
              <Text style={{ color: colors.textPrimary, fontFamily: AppFonts.bodyStrong }}>
                {Strings.ventas.changeDue}: {faltaEfectivo ? "—" : formatCurrency(vuelto)}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={onConfirm}
            disabled={processing || faltaEfectivo}
            accessibilityRole="button"
            accessibilityLabel={`${Strings.ventas.charge} ${formatCurrency(total)}`}
            style={[
              styles.confirm,
              { backgroundColor: processing || faltaEfectivo ? colors.border : AppColors.primary },
            ]}
          >
            <Text style={[styles.confirmText, { fontFamily: AppFonts.bodyStrong }]}>
              {Strings.ventas.charge} {formatCurrency(total)}
            </Text>
          </Pressable>
          <Pressable onPress={onCancel} accessibilityRole="button" style={styles.cancel}>
            <Text style={{ color: colors.textSecondary, fontFamily: AppFonts.body }}>
              {Strings.common.cancel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    ...(Platform.OS === "web" ? { boxShadow: "0 12px 32px rgba(0,0,0,0.16)" } : { elevation: 8 }),
  },
  title: { fontSize: 22, letterSpacing: -0.4 },
  context: { fontSize: 14 },
  lines: { gap: 4 },
  total: { fontSize: 36, letterSpacing: -0.8 },
  methods: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cash: { gap: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 18,
  },
  confirm: { minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#ffffff", fontSize: 16 },
  cancel: { minHeight: 44, alignItems: "center", justifyContent: "center" },
});
