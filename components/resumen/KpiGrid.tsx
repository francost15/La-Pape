import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency, pluralize } from "@/lib/utils/format";
import type { Metricas } from "@/store/resumen-store";
import React, { memo, useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface KpiCardConfig {
  label: string;
  value: string;
  subtitle: string;
  iconName: string;
  accentColor: string;
}

interface KpiCardProps extends KpiCardConfig {
  index: number;
}

interface KpiGridProps {
  metricas: Metricas;
  isMobile: boolean;
}

// ─── Card individual ─────────────────────────────────────────────────────────

const AnimatedKpiWrapper = Animated.createAnimatedComponent(View);

/**
 * Card individual de KPI con animación de entrada escalonada (fade + slide up).
 * Memoizado para no re-renderizar cuando el padre actualiza otros datos.
 */
const KpiCard = memo(function KpiCard({
  label,
  value,
  subtitle,
  iconName,
  accentColor,
  index,
}: KpiCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  // Entrada escalonada: cada card tiene un delay de 60ms para efecto cascade
  useEffect(() => {
    const delay = index * 60;
    opacity.value = withDelay(delay, withTiming(1, { duration: 280 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 280 }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <AnimatedKpiWrapper style={animatedStyle} className="flex-1 min-w-[110px]">
      {/*
       * Card con fondo tintado muy suave del color de acento (5% opacidad).
       * Sin borde lateral pesado — el color de fondo ya da identidad visual suficiente.
       */}
      <View
        className="rounded-2xl p-4 border border-gray-100/60 dark:border-neutral-700 overflow-hidden"
        style={{ backgroundColor: accentColor + "0D" }}
      >
        {/* Fila superior: etiqueta a la izquierda, ícono a la derecha */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-1 mr-2" numberOfLines={1}>
            {label}
          </Text>
          <View
            className="w-7 h-7 rounded-full items-center justify-center shrink-0"
            style={{ backgroundColor: accentColor + "22" }}
          >
            <IconSymbol name={iconName as any} size={14} color={accentColor} />
          </View>
        </View>

        {/* Valor principal — el dato más importante, tamaño dominante */}
        <Text
          className="font-bold text-gray-900 dark:text-white tracking-tight leading-tight"
          style={{ fontSize: 20 }}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {value}
        </Text>

        {/* Subtítulo aclaratorio */}
        <Text className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
          {subtitle}
        </Text>
      </View>
    </AnimatedKpiWrapper>
  );
});

// ─── Componente principal ─────────────────────────────────────────────────────

/**
 * Grid de 3 KPIs principales: Ventas Totales, Ganancia Neta y Devoluciones.
 *
 * Layout:
 * - Mobile: flex-row con wrap (2+1 grid natural según ancho de pantalla)
 * - Desktop: siempre en una fila de 3 sin wrap
 */
export default function KpiGrid({ metricas, isMobile }: KpiGridProps) {
  const gananciaSubtitle =
    metricas.porcentajeGanancia > 0
      ? `${metricas.porcentajeGanancia.toFixed(1)}% margen`
      : "Sin margen registrado";

  const kpis: KpiCardConfig[] = [
    {
      label: "Ventas Totales",
      value: formatCurrency(metricas.ventasTotales),
      subtitle: `${metricas.transacciones} ${pluralize(metricas.transacciones, "venta", "ventas")}`,
      iconName: "dollarsign.circle.fill",
      accentColor: "#ea580c",
    },
    {
      label: "Ganancia Neta",
      value: formatCurrency(metricas.gananciaNeta),
      subtitle: gananciaSubtitle,
      iconName: "chart.line.uptrend.xyaxis",
      accentColor: "#16a34a",
    },
    {
      label: "Devoluciones",
      value: formatCurrency(metricas.totalDevoluciones),
      subtitle: `${metricas.devoluciones} ${pluralize(metricas.devoluciones, "reembolso", "reembolsos")}`,
      iconName: "arrow.uturn.backward",
      accentColor: "#dc2626",
    },
  ];

  return (
    <View className={`mb-4 gap-3 ${isMobile ? "flex-row flex-wrap" : "flex-row"}`}>
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} index={i} {...kpi} />
      ))}
    </View>
  );
}
