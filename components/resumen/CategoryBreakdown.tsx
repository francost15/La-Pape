import EmptyState from "@/components/resumen/shared/EmptyState";
import SectionCard from "@/components/resumen/shared/SectionCard";
import { formatCurrency } from "@/lib/utils/format";
import type { CategoriaVenta } from "@/store/resumen-store";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

// Paleta de colores consistente con el diseño del resto de la app
const COLORS = [
  "#3b82f6", "#ea580c", "#10b981", "#8b5cf6",
  "#f59e0b", "#ef4444", "#ec4899", "#14b8a6",
];

// ─── Donut Chart ──────────────────────────────────────────────────────────────

/**
 * Renderiza un donut chart SVG construyendo los paths manualmente.
 * Se usa SVG nativo para compatibilidad con Expo (web + nativo).
 */
function DonutChart({ data, size }: { data: CategoriaVenta[]; size: number }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  if (total === 0) return null;

  const outerR = size / 2 - 8;
  const innerR = outerR * 0.55;
  const cx = size / 2;
  const cy = size / 2;

  let currentAngle = -90;

  const slices = data.map((d, i) => {
    const angle = (d.total / total) * 360;
    const start = currentAngle;
    const end = currentAngle + angle;
    currentAngle += angle;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1o = cx + outerR * Math.cos(toRad(start));
    const y1o = cy + outerR * Math.sin(toRad(start));
    const x2o = cx + outerR * Math.cos(toRad(end));
    const y2o = cy + outerR * Math.sin(toRad(end));
    const x1i = cx + innerR * Math.cos(toRad(end));
    const y1i = cy + innerR * Math.sin(toRad(end));
    const x2i = cx + innerR * Math.cos(toRad(start));
    const y2i = cy + innerR * Math.sin(toRad(start));
    const large = angle > 180 ? 1 : 0;

    const path = [
      `M ${x1o} ${y1o}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${x2o} ${y2o}`,
      `L ${x1i} ${y1i}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${x2i} ${y2i}`,
      "Z",
    ].join(" ");

    return { path, color: COLORS[i % COLORS.length] };
  });

  return (
    <Svg width={size} height={size}>
      <G>
        {slices.map((s, i) => (
          <Path key={i} d={s.path} fill={s.color} />
        ))}
        <Circle cx={cx} cy={cy} r={innerR - 1} fill="transparent" />
      </G>
    </Svg>
  );
}

// ─── Legend Item ──────────────────────────────────────────────────────────────

interface LegendItemProps {
  color: string;
  label: string;
  value: number;
  percentage: number;
}

/**
 * Fila de leyenda con barra de progreso horizontal.
 * La barra da un escaneo visual rápido de la distribución sin leer los números.
 */
function LegendItem({ color, label, value, percentage }: LegendItemProps) {
  return (
    <View className="py-1.5 gap-1">
      {/* Fila superior: punto de color + nombre + % + monto */}
      <View className="flex-row items-center gap-2">
        <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <Text className="text-[13px] text-gray-700 dark:text-gray-300 flex-1" numberOfLines={1}>
          {label}
        </Text>
        <Text className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
          {percentage.toFixed(0)}%
        </Text>
        <Text className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 tabular-nums min-w-[64px] text-right">
          {formatCurrency(value)}
        </Text>
      </View>

      {/* Barra de progreso: visualización rápida de la proporción */}
      <View className="h-1 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden ml-4">
        <View
          className="h-full rounded-full"
          style={{ backgroundColor: color, width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

interface CategoryBreakdownProps {
  data: CategoriaVenta[];
  isMobile: boolean;
}

export default function CategoryBreakdown({ data, isMobile }: CategoryBreakdownProps) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const chartSize = isMobile ? 140 : 160;
  const isEmpty = data.length === 0 || total === 0;

  return (
    <SectionCard title="Ventas por Categoría">
      {isEmpty ? (
        <EmptyState
          message="Sin datos en este período"
          iconName="chart.pie.fill"
        />
      ) : (
        <View className={isMobile ? "gap-1" : "flex-row gap-4 items-start"}>
          <View className={`items-center ${isMobile ? "mb-2" : ""}`}>
            <DonutChart data={data} size={chartSize} />
          </View>
          <View className="flex-1">
            {data.map((d, i) => (
              <LegendItem
                key={d.nombre}
                color={COLORS[i % COLORS.length]}
                label={d.nombre}
                value={d.total}
                percentage={(d.total / total) * 100}
              />
            ))}
          </View>
        </View>
      )}
    </SectionCard>
  );
}
