import type { CategoriaVenta } from "@/store/resumen-store";
import React from "react";
import { Platform, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

const COLORS = [
  "#3b82f6", "#ea580c", "#10b981", "#8b5cf6",
  "#f59e0b", "#ef4444", "#ec4899", "#14b8a6",
];

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function DonutChart({ data, size }: { data: CategoriaVenta[]; size: number }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  if (total === 0) return null;

  const outerR = size / 2 - 8;
  const innerR = outerR * 0.55;
  const cx = size / 2;
  const cy = size / 2;

  let currentAngle = -90;

  const slices = data.map((d, i) => {
    const pct = d.total / total;
    const angle = pct * 360;
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

function LegendItem({
  color,
  label,
  value,
  percentage,
}: {
  color: string;
  label: string;
  value: number;
  percentage: number;
}) {
  return (
    <View className="flex-row items-center gap-2.5 py-1.5">
      <View className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <Text
        className="text-sm text-gray-700 dark:text-gray-300 flex-1"
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
        {percentage.toFixed(0)}%
      </Text>
      <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums min-w-[70px] text-right">
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

interface CategoryBreakdownProps {
  data: CategoriaVenta[];
  isMobile: boolean;
}

export default function CategoryBreakdown({ data, isMobile }: CategoryBreakdownProps) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const chartSize = isMobile ? 160 : 180;

  return (
    <View
      className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-gray-100 dark:border-neutral-700"
      style={
        Platform.OS === "web"
          ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
          : { elevation: 1 }
      }
    >
      <Text className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">
        Ventas por Categoría
      </Text>

      {data.length === 0 || total === 0 ? (
        <View className="py-10 items-center">
          <Text className="text-sm text-gray-400 dark:text-gray-500">
            Sin datos en este período
          </Text>
        </View>
      ) : (
        <View className={isMobile ? "" : "flex-row gap-6 items-start"}>
          <View className={`items-center ${isMobile ? "mb-4" : ""}`}>
            <DonutChart data={data} size={chartSize} />
          </View>
          <View className="flex-1">
            {data.map((d, i) => (
              <LegendItem
                key={d.nombre}
                color={COLORS[i % COLORS.length]}
                label={d.nombre}
                value={d.total}
                percentage={total > 0 ? (d.total / total) * 100 : 0}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
