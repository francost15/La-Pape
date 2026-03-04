import { AppFonts } from "@/constants/typography";
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
 * KPI card con diseño editorial: sin ícono en círculo.
 * La identidad visual viene de la franja de acento superior (2px) y
 * la jerarquía tipográfica — el número es el protagonista.
 */
const KpiCard = memo(function KpiCard({
  label,
  value,
  subtitle,
  accentColor,
  index,
}: KpiCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

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
    <AnimatedKpiWrapper style={animatedStyle} className="min-w-[100px] flex-1">
      <View className="overflow-hidden rounded-xl border border-gray-100/60 bg-white dark:border-neutral-700/50 dark:bg-neutral-800">
        {/* Franja de acento: identidad cromática sin ícono */}
        <View style={{ height: 2, backgroundColor: accentColor }} />

        <View className="p-4">
          {/* Etiqueta en small-caps — referencia editorial, no de software */}
          <Text
            className="mb-2 text-[9px] font-semibold text-gray-400 uppercase dark:text-gray-500"
            style={{ fontFamily: AppFonts.bodyStrong, letterSpacing: 1.4 }}
            numberOfLines={1}
          >
            {label}
          </Text>

          {/* Valor: protagonista visual de la card */}
          <Text
            className="leading-none font-bold tracking-tight text-gray-900 dark:text-white"
            style={{ fontSize: 22, fontFamily: AppFonts.display }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {value}
          </Text>

          {/* Subtítulo: refuerzo contextual */}
          <Text
            className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500"
            style={{ fontFamily: AppFonts.body }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    </AnimatedKpiWrapper>
  );
});

// ─── Grid ─────────────────────────────────────────────────────────────────────

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
      accentColor: "#ea580c",
    },
    {
      label: "Ganancia Neta",
      value: formatCurrency(metricas.gananciaNeta),
      subtitle: gananciaSubtitle,
      accentColor: "#16a34a",
    },
    {
      label: "Devoluciones",
      value: formatCurrency(metricas.totalDevoluciones),
      subtitle: `${metricas.devoluciones} ${pluralize(metricas.devoluciones, "reembolso", "reembolsos")}`,
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
