import { IconSymbol } from "@/components/ui/icon-symbol";
import { useHaptic } from "@/hooks/use-haptic";
import { Venta, VentaDetalle } from "@/interface";
import { formatCurrency, formatTime } from "@/lib/utils/format";
import React, { useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface VentaCardProps {
  venta: Venta;
  detalles: VentaDetalle[];
  fecha: Date;
  isReembolso: boolean;
  expandido: boolean;
  productNames: Record<string, string>;
  onToggle: () => void;
  onVerRecibo: (v: Venta) => void;
  onReembolso: (v: Venta) => void;
}

/**
 * VentaCard — Digital Atelier Style
 *
 * Clean row on flat surface. No card shadow, no card border.
 * Left accent bar (3px) for visual identity.
 * Expanding inline without adding a new background layer.
 */
export default React.memo(function VentaCard({
  venta,
  detalles,
  fecha,
  isReembolso,
  expandido,
  productNames,
  onToggle,
  onVerRecibo,
  onReembolso,
}: VentaCardProps) {
  const haptic = useHaptic();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(expandido ? 1 : 0, { duration: 200 });
  }, [expandido, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(280).springify().damping(18)}
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: Platform.OS === "web" ? "var(--bg-surface)" : undefined,
        borderWidth: 1,
        borderColor: Platform.OS === "web" ? "var(--border-default)" : "rgba(0,0,0,0.04)",
      }}
    >
      {/* Left accent bar */}
      <View
        className="border-l-[3px]"
        style={{ borderLeftColor: isReembolso ? "#ef4444" : "#ea580c" }}
      >
        <Pressable
          onPress={() => {
            haptic();
            onToggle();
          }}
          className="flex-row items-center justify-between px-4 py-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          accessibilityRole="button"
          accessibilityLabel={`Venta ${formatCurrency(venta.total)}, ${detalles.length} productos`}
        >
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-medium text-[#1A1A1A] dark:text-[#F0F0F0]">
              {formatTime(fecha)}
            </Text>
            <Text className="mt-0.5 text-xs text-[#9CA3AF] dark:text-[#5A6478]" numberOfLines={1}>
              {detalles.length} producto{detalles.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Text
            className={`mr-2 text-lg font-bold ${
              isReembolso ? "text-red-500" : "text-[#1A1A1A] dark:text-[#F0F0F0]"
            }`}
          >
            {formatCurrency(venta.total)}
          </Text>
          <View
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: expandido
                ? "rgba(234,88,12,0.08)"
                : Platform.OS === "web"
                  ? "var(--bg-surface-hover)"
                  : "rgba(0,0,0,0.04)",
            }}
          >
            <IconSymbol
              name={expandido ? "chevron.up" : "chevron.down"}
              size={12}
              color={expandido ? "#ea580c" : "#9CA3AF"}
            />
          </View>
        </Pressable>
      </View>

      {/* ── Expanded Details ────────────────────── */}
      {expandido ? (
        <Animated.View style={animatedStyle}>
          <View
            className="px-4 pt-3 pb-4"
            style={{
              borderTopWidth: 1,
              borderTopColor: Platform.OS === "web" ? "var(--border-default)" : "rgba(0,0,0,0.04)",
            }}
          >
            <Text className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] dark:text-[#5A6478]">
              Productos ({detalles.length})
            </Text>
            <View className="mb-4 gap-1">
              {detalles.map((d) => {
                const nombre = productNames[d.producto_id] ?? "Producto";
                return (
                  <View key={d.id} className="flex-row items-center justify-between py-1.5">
                    <Text
                      className="mr-2 flex-1 text-[13px] text-[#6B7280] dark:text-[#8B95A5]"
                      numberOfLines={1}
                    >
                      {d.cantidad}× {nombre}
                    </Text>
                    <Text className="text-[13px] font-medium tabular-nums text-[#1A1A1A] dark:text-[#F0F0F0]">
                      {formatCurrency(d.total_linea)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className="flex-row gap-2.5">
              <Pressable
                onPress={() => {
                  haptic();
                  onVerRecibo(venta);
                }}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                style={{
                  backgroundColor: "#ea580c",
                }}
                accessibilityRole="button"
                accessibilityLabel="Ver recibo"
              >
                <IconSymbol name="eye.fill" size={16} color="white" />
                <Text className="text-[14px] font-semibold text-white">Ver Recibo</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  haptic();
                  onReembolso(venta);
                }}
                disabled={isReembolso}
                style={({ pressed }) => ({
                  opacity: isReembolso ? 0.4 : pressed ? 0.85 : 1,
                })}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 ${
                  isReembolso ? "" : ""
                }`}
                accessibilityRole="button"
                accessibilityLabel={isReembolso ? "Venta ya reembolsada" : "Reembolsar venta"}
              >
                <IconSymbol
                  name="arrow.uturn.backward"
                  size={16}
                  color={isReembolso ? "#9ca3af" : "#dc2626"}
                />
                <Text
                  className={`text-[14px] font-semibold ${
                    isReembolso
                      ? "text-[#9CA3AF]"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  Reembolso
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
});
