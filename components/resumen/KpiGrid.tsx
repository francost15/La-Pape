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
 * KPI card — Digital Atelier style.
 * NO card border, NO card shadow. Just accent line + typography.
 * Lives directly on the background canvas for a flat, integrated look.
 */
const KpiCard = memo(function KpiCard({
  label,
  value,
  subtitle,
  accentColor,
  index,
}: KpiCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 350 }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <AnimatedKpiWrapper style={animatedStyle} className="min-w-[100px] flex-1">
      {/* Accent line at top — the only visual chrome */}
      <View style={{ height: 3, backgroundColor: accentColor, borderRadius: 2, marginBottom: 16 }} />

      {/* Label */}
      <Text
        className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#9CA3AF] dark:text-[#5A6478]"
        style={{ fontFamily: AppFonts.bodyStrong, letterSpacing: 1.6 }}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Value — protagonist */}
      <Text
        className="leading-none font-bold tracking-tight text-[#1A1A1A] dark:text-[#F0F0F0]"
        style={{ fontSize: 28, fontFamily: AppFonts.display }}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {value}
      </Text>

      {/* Subtitle */}
      <Text
        className="mt-2 text-[11px] text-[#9CA3AF] dark:text-[#5A6478]"
        style={{ fontFamily: AppFonts.body }}
      >
        {subtitle}
      </Text>
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
    <View className={`mb-6 gap-6 ${isMobile ? "flex-row flex-wrap" : "flex-row"}`}>
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} index={i} {...kpi} />
      ))}
    </View>
  );
}
