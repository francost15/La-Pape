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
  const translateY = useSharedValue(15);

  useEffect(() => {
    const delay = index * 100;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 450 }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <AnimatedKpiWrapper 
      style={animatedStyle} 
      className="min-w-[140px] flex-1 bg-white dark:bg-[#1A1F2B] rounded-[24px] p-6"
    >
      <View className="flex-row items-start gap-4">
        {/* Accent bar - refined vertical marker */}
        <View 
          style={{ width: 3, height: 32, backgroundColor: accentColor, borderRadius: 2 }} 
          className="mt-1"
        />

        <View className="flex-1">
          <Text
            className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9CA3AF] dark:text-[#5A6478]"
            style={{ fontFamily: AppFonts.bodyStrong }}
            numberOfLines={1}
          >
            {label}
          </Text>

          <Text
            className="leading-tight text-[#111827] dark:text-[#F9FAFB] tracking-tighter"
            style={{ fontSize: 32, fontFamily: AppFonts.display }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {value}
          </Text>

          {subtitle ? (
            <Text
              className="mt-2 text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider"
              style={{ fontFamily: AppFonts.body }}
            >
              {subtitle}
            </Text>
          ) : null}
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
    <View className={`mb-6 gap-6 ${isMobile ? "flex-row flex-wrap" : "flex-row"}`}>
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} index={i} {...kpi} />
      ))}
    </View>
  );
}
