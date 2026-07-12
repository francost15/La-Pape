import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { useStaggeredEntrance } from "@/hooks/use-staggered-entrance";
import { formatCurrency, pluralize } from "@/lib/utils/format";
import type { KpiCardConfig, KpiCardProps, KpiGridProps } from "@/interface/resumen";
import React, { memo } from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

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
  const animatedStyle = useStaggeredEntrance(index, { distance: 15, duration: 260 });

  return (
    <AnimatedKpiWrapper
      style={animatedStyle}
      className="min-w-[140px] flex-1 rounded-[24px] bg-surface-elevated p-6"
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}. ${subtitle}`}
    >
      <View className="flex-row items-start gap-4">
        {/* Accent bar - refined vertical marker */}
        <View
          style={{ width: 3, height: 32, backgroundColor: accentColor, borderRadius: 2 }}
          className="mt-1"
        />

        <View className="flex-1">
          <Text
            className="mb-1 text-[10px] font-bold tracking-[0.2em] text-content-secondary uppercase"
            style={{ fontFamily: AppFonts.bodyStrong }}
            numberOfLines={1}
          >
            {label}
          </Text>

          <Text
            className="leading-tight tracking-tighter text-[#111827] dark:text-[#F9FAFB]"
            style={{ fontSize: 32, fontFamily: AppFonts.display }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {value}
          </Text>

          {subtitle ? (
            <Text
              className="mt-2 text-[11px] font-medium tracking-wider text-[#6B7280] uppercase dark:text-[#9CA3AF]"
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
      accentColor: AppColors.primary,
    },
    {
      label: "Ganancia Neta",
      value: formatCurrency(metricas.gananciaNeta),
      subtitle: gananciaSubtitle,
      accentColor: AppColors.success,
    },
    {
      label: "Devoluciones",
      value: formatCurrency(metricas.totalDevoluciones),
      subtitle: `${metricas.devoluciones} ${pluralize(metricas.devoluciones, "reembolso", "reembolsos")}`,
      accentColor: AppColors.error,
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
