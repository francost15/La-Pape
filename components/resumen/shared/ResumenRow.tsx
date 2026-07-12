import { AppColors } from "@/constants/colors";
import type { ResumenRowProps } from "@/interface/resumen";
import React from "react";
import { Pressable, Text, View } from "react-native";

/**
 * ResumenRow — fila base de las listas del dashboard.
 *
 * Unifica el esqueleto que repetían `RankingRow`, `StockRow` y
 * `VentasPorUsuarioRow`: contenedor con divisor sutil + `py-2.5`, columna
 * central título/subtítulo y slots `leading`/`trailing`. `rank` pinta el número
 * de posición; `children` permite añadir contenido bajo la fila (barra de
 * participación) sin romper el divisor.
 */
export const ResumenRow = React.memo(function ResumenRow({
  leading,
  rank,
  title,
  subtitle,
  trailing,
  showDivider,
  onPress,
  children,
}: ResumenRowProps) {
  const content = (
    <View
      className={`py-2.5 ${showDivider ? "border-b" : ""}`}
      style={showDivider ? { borderBottomColor: "rgba(0,0,0,0.04)" } : undefined}
    >
      <View className="flex-row items-center gap-3">
        {rank != null ? (
          <Text
            className="w-4 text-center text-[12px] font-bold tabular-nums"
            style={{ color: rank === 1 ? AppColors.primary : AppColors.light.textSecondary }}
          >
            {rank}
          </Text>
        ) : null}

        {leading}

        <View className="min-w-0 flex-1">
          <Text
            className="text-[13px] leading-5 font-semibold text-content-primary"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-[10px] text-content-secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {trailing}
      </View>

      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-60">
        {content}
      </Pressable>
    );
  }
  return content;
});
