import { IconSymbol } from "@/components/ui/icon-symbol";
import { useHaptic } from "@/hooks/use-haptic";
import { Venta, VentaDetalle } from "@/interface";
import { formatCurrency, formatTime } from "@/lib/utils/format";
import React, { useEffect } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, {
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
    <View
      className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-700"
      style={
        Platform.OS === "web"
          ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
          : { elevation: 2 }
      }
    >
      <TouchableOpacity
        onPress={() => {
          haptic();
          onToggle();
        }}
        className="flex-row items-center justify-between px-4 py-3.5"
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Venta ${formatCurrency(venta.total)}, ${detalles.length} productos`}
      >
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {formatTime(fecha)}
          </Text>
          <Text
            className="text-xs text-gray-400 dark:text-gray-500 mt-0.5"
            numberOfLines={1}
          >
            {detalles.length} producto{detalles.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <Text
          className={`text-lg font-bold mr-2 ${
            isReembolso
              ? "text-red-600 dark:text-red-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {formatCurrency(venta.total)}
        </Text>
        <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-700 items-center justify-center">
          <IconSymbol
            name={expandido ? "chevron.up" : "chevron.down"}
            size={14}
            color="#78716c"
          />
        </View>
      </TouchableOpacity>

      {expandido ? (
        <Animated.View style={animatedStyle}>
          <View className="border-t border-gray-100 dark:border-neutral-700 px-4 pt-3 pb-4">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Productos ({detalles.length})
            </Text>
            <View className="gap-2 mb-4">
              {detalles.map((d) => {
                const nombre = productNames[d.producto_id] ?? "Producto";
                return (
                  <View
                    key={d.id}
                    className="flex-row justify-between items-center py-1.5"
                  >
                    <Text
                      className="text-gray-700 dark:text-gray-300 flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {d.cantidad}× {nombre}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm tabular-nums">
                      {formatCurrency(d.total_linea)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  haptic();
                  onVerRecibo(venta);
                }}
                className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-orange-600"
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Ver recibo"
              >
                <IconSymbol name="eye.fill" size={18} color="white" />
                <Text className="text-white font-semibold text-[15px]">
                  Ver Recibo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  haptic();
                  onReembolso(venta);
                }}
                disabled={isReembolso}
                style={isReembolso ? { opacity: 0.6 } : undefined}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${
                  isReembolso
                    ? "bg-gray-100 dark:bg-neutral-700"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={isReembolso ? "Venta ya reembolsada" : "Reembolsar venta"}
              >
                <IconSymbol
                  name="arrow.uturn.backward"
                  size={18}
                  color={isReembolso ? "#9ca3af" : "#dc2626"}
                />
                <Text
                  className={`font-semibold text-[15px] ${
                    isReembolso
                      ? "text-gray-500 dark:text-gray-500"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  Reembolso
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
});
