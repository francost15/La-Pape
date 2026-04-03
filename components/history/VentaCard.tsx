import { IconSymbol } from "@/components/ui/icon-symbol";
import { useHaptic } from "@/hooks/use-haptic";
import { Venta, VentaDetalle } from "@/interface";
import { formatCurrency, formatTime } from "@/lib/utils/format";
import { AppFonts } from "@/constants/typography";
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
      className="overflow-hidden rounded-2xl bg-white dark:bg-[#1A1F2B]"
      style={{
        boxShadow: Platform.OS === "web" ? "0 4px 12px rgba(0,0,0,0.02)" : undefined,
        elevation: Platform.OS !== "web" ? 2 : undefined,
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
          className="flex-row items-center justify-between px-5 py-5"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          accessibilityRole="button"
          accessibilityLabel={`Venta ${formatCurrency(venta.total)}, ${detalles.length} productos`}
        >
          <View className="min-w-0 flex-1">
            <Text 
              className="text-[10px] font-bold text-[#9CA3AF] dark:text-[#5A6478] uppercase tracking-[0.15em] mb-0.5"
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              {formatTime(fecha)}
            </Text>
            <Text 
              className="text-[13px] text-[#4B5563] dark:text-[#9CA3AF]" 
              style={{ fontFamily: AppFonts.body }}
              numberOfLines={1}
            >
              {detalles.length} producto{detalles.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Text
            className={`mr-4 text-xl tracking-tight ${
              isReembolso ? "text-red-500" : "text-[#111827] dark:text-[#F9FAFB]"
            }`}
            style={{ fontFamily: AppFonts.heading }}
          >
            {formatCurrency(venta.total)}
          </Text>
          <View
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: expandido
                ? "rgba(234,88,12,0.1)"
                : "rgba(0,0,0,0.03)",
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
            className="px-5 pt-4 pb-5"
            style={{
              borderTopWidth: 1,
              borderTopColor: "rgba(0,0,0,0.04)",
            }}
          >
            <Text 
              className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] dark:text-[#5A6478]"
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              DETALLE DE PRODUCTOS
            </Text>
            <View className="mb-6 gap-2">
              {detalles.map((d) => {
                const nombre = productNames[d.producto_id] ?? "Producto";
                return (
                  <View key={d.id} className="flex-row items-baseline justify-between py-1">
                    <Text
                      className="mr-2 flex-1 text-[13px] text-[#6B7280] dark:text-[#9CA3AF]"
                      style={{ fontFamily: AppFonts.body }}
                      numberOfLines={1}
                    >
                      {d.cantidad} × {nombre}
                    </Text>
                    <Text 
                      className="text-[13px] font-bold tabular-nums text-[#111827] dark:text-[#F9FAFB]"
                      style={{ fontFamily: AppFonts.bodyStrong }}
                    >
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
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4"
                style={{
                  backgroundColor: "#ea580c",
                }}
                accessibilityRole="button"
                accessibilityLabel="Ver recibo"
              >
                <IconSymbol name="eye.fill" size={16} color="white" />
                <Text 
                  className="text-[14px] font-bold text-white uppercase tracking-wider"
                  style={{ fontFamily: AppFonts.bodyStrong }}
                >
                  Ver Recibo
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  haptic();
                  onReembolso(venta);
                }}
                disabled={isReembolso}
                style={({ pressed }) => ({
                  opacity: isReembolso ? 0.3 : pressed ? 0.8 : 1,
                  borderWidth: 1.5,
                  borderColor: isReembolso ? "rgba(0,0,0,0.05)" : "rgba(220, 38, 38, 0.2)",
                  backgroundColor: "transparent",
                })}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-4"
                accessibilityRole="button"
                accessibilityLabel={isReembolso ? "Venta ya reembolsada" : "Reembolsar venta"}
              >
                <IconSymbol
                  name="arrow.uturn.backward"
                  size={14}
                  color={isReembolso ? "#9ca3af" : "#dc2626"}
                />
                <Text
                  className={`text-[13px] font-bold uppercase tracking-wider ${
                    isReembolso
                      ? "text-[#9CA3AF]"
                      : "text-red-600 dark:text-red-400"
                  }`}
                  style={{ fontFamily: AppFonts.bodyStrong }}
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
