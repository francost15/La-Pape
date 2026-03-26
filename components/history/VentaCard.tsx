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
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-700 dark:bg-neutral-800"
      style={Platform.OS === "web" ? { boxShadow: "0 2px 8px rgba(0,0,0,0.08)" } : { elevation: 3 }}
    >
      <View className="border-l-4" style={{ borderLeftColor: isReembolso ? "#ef4444" : "#ea580c" }}>
        <Pressable
          onPress={() => {
            haptic();
            onToggle();
          }}
          className="flex-row items-center justify-between px-4 py-4"
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          accessibilityRole="button"
          accessibilityLabel={`Venta ${formatCurrency(venta.total)}, ${detalles.length} productos`}
        >
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {formatTime(fecha)}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500" numberOfLines={1}>
              {detalles.length} producto{detalles.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Text
            className={`mr-2 text-lg font-bold ${
              isReembolso ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
            }`}
          >
            {formatCurrency(venta.total)}
          </Text>
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${
              expandido ? "bg-orange-100 dark:bg-orange-900/30" : "bg-gray-100 dark:bg-neutral-700"
            }`}
          >
            <IconSymbol
              name={expandido ? "chevron.up" : "chevron.down"}
              size={14}
              color={expandido ? "#ea580c" : "#78716c"}
            />
          </View>
        </Pressable>
      </View>

      {expandido ? (
        <Animated.View style={animatedStyle}>
          <View className="border-t border-gray-100 bg-gray-50/50 px-4 pt-4 pb-4 dark:border-neutral-700 dark:bg-neutral-800/50">
            <Text className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Productos ({detalles.length})
            </Text>
            <View className="mb-4 gap-2">
              {detalles.map((d) => {
                const nombre = productNames[d.producto_id] ?? "Producto";
                return (
                  <View key={d.id} className="flex-row items-center justify-between py-1.5">
                    <Text
                      className="mr-2 flex-1 text-gray-700 dark:text-gray-300"
                      numberOfLines={1}
                    >
                      {d.cantidad}× {nombre}
                    </Text>
                    <Text className="text-sm text-gray-500 tabular-nums dark:text-gray-400">
                      {formatCurrency(d.total_linea)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  haptic();
                  onVerRecibo(venta);
                }}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5"
                style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
                accessibilityRole="button"
                accessibilityLabel="Ver recibo"
              >
                <IconSymbol name="eye.fill" size={18} color="white" />
                <Text className="text-[15px] font-semibold text-white">Ver Recibo</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  haptic();
                  onReembolso(venta);
                }}
                disabled={isReembolso}
                style={({ pressed }) => ({
                  opacity: isReembolso ? 0.5 : pressed ? 0.88 : 1,
                })}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3.5 ${
                  isReembolso ? "bg-gray-100 dark:bg-neutral-700" : "bg-red-50 dark:bg-red-900/20"
                }`}
                accessibilityRole="button"
                accessibilityLabel={isReembolso ? "Venta ya reembolsada" : "Reembolsar venta"}
              >
                <IconSymbol
                  name="arrow.uturn.backward"
                  size={18}
                  color={isReembolso ? "#9ca3af" : "#dc2626"}
                />
                <Text
                  className={`text-[15px] font-semibold ${
                    isReembolso
                      ? "text-gray-500 dark:text-gray-500"
                      : "text-red-700 dark:text-red-300"
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
