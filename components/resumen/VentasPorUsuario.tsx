import EmptyState from "@/components/resumen/shared/EmptyState";
import SectionCard from "@/components/resumen/shared/SectionCard";
import { formatCurrency, pluralize } from "@/lib/utils/format";
import type { VentasPorUsuario as VentasPorUsuarioType } from "@/store/resumen-store";
import { useHaptic } from "@/hooks/use-haptic";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

// ─── Utilidades ───────────────────────────────────────────────────────────────

function getInitials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return nombre.slice(0, 2).toUpperCase() || "U";
}

// ─── Row individual ───────────────────────────────────────────────────────────

interface VentasPorUsuarioRowProps {
  item: VentasPorUsuarioType;
  porcentajeDelTotal: number;
  index: number;
  showDivider: boolean;
}

/**
 * Fila de vendedor sin fondo de row — separada por divisor sutil.
 * La barra de progreso usa 2px para no dominar visualmente.
 */
function VentasPorUsuarioRow({
  item,
  porcentajeDelTotal,
  index,
  showDivider,
}: VentasPorUsuarioRowProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    const delay = index * 50;
    opacity.value = withDelay(delay, withTiming(1, { duration: 240 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 240 }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const showPhoto = Boolean(item.foto?.trim()) && !photoError;

  return (
    <Animated.View
      className={`gap-1.5 py-2.5 ${showDivider ? "border-b" : ""}`}
      style={[animatedStyle, showDivider ? { borderBottomColor: "rgba(0,0,0,0.04)" } : undefined]}
    >
      {/* Avatar + nombre + ventas + monto */}
      <View className="flex-row items-center gap-3">
        {/* Avatar circular */}
        <View className="h-8 w-8 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(234,88,12,0.08)" }}>
          {showPhoto ? (
            <Image
              source={{ uri: item.foto }}
              style={{ width: 32, height: 32 }}
              contentFit="cover"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text className="text-[11px] font-bold text-[#ea580c] dark:text-[#F97316]">
                {getInitials(item.nombre)}
              </Text>
            </View>
          )}
        </View>

        {/* Nombre y subtítulo */}
        <View className="min-w-0 flex-1">
          <Text
            className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0F0F0]"
            numberOfLines={1}
          >
            {item.nombre}
          </Text>
          <Text className="text-[10px] text-[#9CA3AF] dark:text-[#5A6478]">
            {item.transacciones} {pluralize(item.transacciones, "venta", "ventas")}
          </Text>
        </View>

        {/* Monto + porcentaje */}
        <View className="shrink-0 items-end">
          <Text className="text-[13px] font-bold text-[#1A1A1A] tabular-nums dark:text-[#F0F0F0]">
            {formatCurrency(item.total)}
          </Text>
          <Text className="text-[10px] text-[#9CA3AF] tabular-nums dark:text-[#5A6478]">
            {porcentajeDelTotal.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Barra de participación: 2px, discreta */}
      <View className="ml-11 h-0.5 overflow-hidden rounded-full bg-[#F5F5F4] dark:bg-[#1A1F2B]">
        <View
          className="h-full rounded-full bg-[#ea580c]"
          style={{ width: `${porcentajeDelTotal}%` }}
        />
      </View>
    </Animated.View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const MAX_VISIBLE = 5;

interface VentasPorUsuarioProps {
  data: VentasPorUsuarioType[];
}

export default function VentasPorUsuario({ data }: VentasPorUsuarioProps) {
  const [expanded, setExpanded] = useState(false);
  const haptic = useHaptic();
  const hasMore = data.length > MAX_VISIBLE;
  const visibleData = expanded || !hasMore ? data : data.slice(0, MAX_VISIBLE);
  const remainingCount = data.length - MAX_VISIBLE;
  const totalGeneral = data.reduce((sum, u) => sum + u.total, 0);

  const handleVerMas = useCallback(() => {
    haptic();
    setExpanded(true);
  }, [haptic]);

  return (
    <SectionCard title="Ventas por Usuario">
      {data.length === 0 ? (
        <EmptyState message="Sin datos en este período" iconName="person.2.fill" />
      ) : (
        <>
          <View>
            {visibleData.map((item, index) => (
              <VentasPorUsuarioRow
                key={item.usuario_id}
                item={item}
                index={index}
                porcentajeDelTotal={totalGeneral > 0 ? (item.total / totalGeneral) * 100 : 0}
                showDivider={index < visibleData.length - 1}
              />
            ))}
          </View>

          {hasMore && !expanded ? (
            <Pressable onPress={handleVerMas} className="mt-3 items-center py-2 active:opacity-70">
              <Text
                className="text-[12px] font-semibold text-orange-500 uppercase dark:text-orange-400"
                style={{ letterSpacing: 0.8 }}
              >
                Ver {remainingCount} más
              </Text>
            </Pressable>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}
