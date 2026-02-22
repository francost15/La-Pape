import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Metricas } from "@/store/resumen-store";
import React from "react";
import { Platform, Text, View } from "react-native";

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface KpiCardProps {
  label: string;
  value: string;
  subtitle: string;
  iconName: string;
  accentColor: string;
}

function KpiCard({ label, value, subtitle, iconName, accentColor }: KpiCardProps) {
  return (
    <View
      className="flex-1 min-w-[140px] bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-gray-100 dark:border-neutral-700"
      style={
        Platform.OS === "web"
          ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
          : { elevation: 1 }
      }
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: accentColor + "18" }}
        >
          <IconSymbol
            name={iconName as any}
            size={18}
            color={accentColor}
          />
        </View>
      </View>

      <Text className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
        {value}
      </Text>

      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
        {label}
      </Text>

      <Text className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
        {subtitle}
      </Text>
    </View>
  );
}

interface KpiGridProps {
  metricas: Metricas;
  isMobile: boolean;
}

export default function KpiGrid({ metricas, isMobile }: KpiGridProps) {
  const gananciaSubtitle = metricas.porcentajeGanancia > 0
    ? `${metricas.porcentajeGanancia.toFixed(1)}% margen`
    : "Sin margen";

  return (
    <View
      className={`mb-6 gap-3 ${
        isMobile ? "flex-col" : "flex-row"
      }`}
    >
      <KpiCard
        label="Ventas Totales"
        value={formatCurrency(metricas.ventasTotales)}
        subtitle={`${metricas.transacciones} venta${metricas.transacciones !== 1 ? "s" : ""}`}
        iconName="dollarsign.circle.fill"
        accentColor="#ea580c"
      />
      <KpiCard
        label="Ganancia Neta"
        value={formatCurrency(metricas.gananciaNeta)}
        subtitle={gananciaSubtitle}
        iconName="chart.line.uptrend.xyaxis"
        accentColor="#16a34a"
      />
      <KpiCard
        label="Devoluciones"
        value={formatCurrency(metricas.totalDevoluciones)}
        subtitle={`${metricas.devoluciones} reembolso${metricas.devoluciones !== 1 ? "s" : ""}`}
        iconName="arrow.uturn.backward"
        accentColor="#dc2626"
      />
    </View>
  );
}
