import AppText from "@/components/ui/AppText";
import Button from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { useHaptic } from "@/hooks/use-haptic";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { VentaCardProps } from "@/interface/ventas";
import { formatCurrency, formatTime, pluralize } from "@/lib/utils/format";
import { shadows } from "@/lib/utils/shadows";
import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  FadeInDown,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/**
 * VentaCard — fila expandible del historial.
 * Barra de acento izquierda; detalle inline sin capa de fondo extra.
 */
function VentaDetails({
  venta,
  detalles,
  productNames,
  isReembolso,
  colors,
  animatedStyle,
  onVerRecibo,
  onReembolso,
}: Pick<
  VentaCardProps,
  "venta" | "detalles" | "productNames" | "isReembolso" | "onVerRecibo" | "onReembolso"
> & {
  colors: ReturnType<typeof useThemeColors>["colors"];
  animatedStyle: { opacity: number };
}) {
  return (
    <Animated.View style={animatedStyle}>
      <View className="px-5 pt-4 pb-5" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
        <AppText variant="label" style={{ marginBottom: 12 }}>
          Detalle de productos
        </AppText>
        <View className="mb-6 gap-2">
          {detalles.map((d) => (
            <View key={d.id} className="flex-row items-baseline justify-between py-1">
              <AppText variant="label" style={{ flex: 1, marginRight: 8 }} numberOfLines={1}>
                {d.cantidad} × {productNames[d.producto_id] ?? "Producto"}
              </AppText>
              <AppText variant="bodyStrong" style={{ fontVariant: ["tabular-nums"] }}>
                {formatCurrency(d.total_linea)}
              </AppText>
            </View>
          ))}
        </View>
        <View className="flex-row gap-2.5">
          <View style={{ flex: 1 }}>
            <Button
              title="Ver recibo"
              icon={<IconSymbol name="eye.fill" size={16} color="white" />}
              onPress={() => onVerRecibo(venta)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Reembolso"
              variant="secondary"
              disabled={isReembolso}
              icon={
                <IconSymbol
                  name="arrow.uturn.backward"
                  size={14}
                  color={isReembolso ? colors.textMuted : AppColors.error}
                />
              }
              onPress={() => onReembolso(venta)}
              style={{ borderColor: isReembolso ? colors.border : "rgba(220, 38, 38, 0.2)" }}
              textStyle={{ color: isReembolso ? colors.textMuted : AppColors.error }}
              accessibilityLabel={isReembolso ? "Venta ya reembolsada" : "Reembolsar venta"}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
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
  const { isDark, colors } = useThemeColors();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.set(withTiming(expandido ? 1 : 0, { duration: 200 }));
  }, [expandido, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.get(),
  }));

  const accent = isReembolso ? AppColors.errorLight : AppColors.primary;
  const totalColor = isReembolso ? AppColors.error : colors.textPrimary;

  return (
    <Animated.View
      entering={FadeInDown.duration(280).springify().damping(18).reduceMotion(ReduceMotion.System)}
      className="overflow-hidden rounded-2xl"
      style={{
        backgroundColor: colors.surfaceElevated,
        ...shadows.subtle,
      }}
    >
      <View className="border-l-[3px]" style={{ borderLeftColor: accent }}>
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
            <AppText variant="caption" color={colors.textLabel} style={{ marginBottom: 2 }}>
              {formatTime(fecha)}
            </AppText>
            <AppText variant="label" numberOfLines={1}>
              {detalles.length} {pluralize(detalles.length, "producto", "productos")}
            </AppText>
          </View>

          <AppText variant="heading" color={totalColor} style={{ marginRight: 16, fontSize: 20 }}>
            {formatCurrency(venta.total)}
          </AppText>

          <View
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: expandido
                ? isDark
                  ? AppColors.primaryGhostDark
                  : AppColors.primaryGhost
                : colors.surfaceHover,
            }}
          >
            <IconSymbol
              name={expandido ? "chevron.up" : "chevron.down"}
              size={12}
              color={expandido ? AppColors.primary : colors.textMuted}
            />
          </View>
        </Pressable>
      </View>

      {expandido ? (
        <VentaDetails
          venta={venta}
          detalles={detalles}
          productNames={productNames}
          isReembolso={isReembolso}
          colors={colors}
          animatedStyle={animatedStyle}
          onVerRecibo={onVerRecibo}
          onReembolso={onReembolso}
        />
      ) : null}
    </Animated.View>
  );
});
