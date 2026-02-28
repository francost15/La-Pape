import EmptyState from "@/components/resumen/shared/EmptyState";
import SectionCard from "@/components/resumen/shared/SectionCard";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { formatCurrency, pluralize } from "@/lib/utils/format";
import type { VentasPorUsuario as VentasPorUsuarioType } from "@/store/resumen-store";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

// ─── Utilidades ───────────────────────────────────────────────────────────────

/** Retorna las iniciales de un nombre para el avatar fallback. */
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
  /** Porcentaje del total de ventas que representa este usuario (0-100) */
  porcentajeDelTotal: number;
  index: number;
}

/**
 * Fila de vendedor con avatar, stats y barra de proporción.
 * Diseñada para ocupar siempre el ancho completo de la sección (no se wrappea).
 * La barra de progreso permite comparar el peso de cada vendedor de un vistazo.
 */
function VentasPorUsuarioRow({ item, porcentajeDelTotal, index }: VentasPorUsuarioRowProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);
  const [photoError, setPhotoError] = useState(false);

  // Animación de entrada escalonada por índice
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
      style={animatedStyle}
      // Siempre ocupa el ancho completo del contenedor — no usar flex-1 aquí
      className="py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-neutral-700/50 gap-2"
    >
      {/* Avatar + nombre + ventas + monto */}
      <View className="flex-row items-center gap-3">
        {/* Avatar circular */}
        <View className="w-9 h-9 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-900/30 shrink-0">
          {showPhoto ? (
            <Image
              source={{ uri: item.foto }}
              style={{ width: 36, height: 36 }}
              contentFit="cover"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-orange-600 dark:text-orange-400 font-bold text-xs">
                {getInitials(item.nombre)}
              </Text>
            </View>
          )}
        </View>

        {/* Nombre y subtítulo de ventas */}
        <View className="flex-1 min-w-0">
          <Text className="text-[13px] font-semibold text-gray-800 dark:text-gray-200" numberOfLines={1}>
            {item.nombre}
          </Text>
          <Text className="text-[11px] text-gray-500 dark:text-gray-400">
            {item.transacciones} {pluralize(item.transacciones, "venta", "ventas")}
          </Text>
        </View>

        {/* Monto + porcentaje */}
        <View className="items-end shrink-0">
          <Text className="text-[13px] font-bold text-orange-600 dark:text-orange-400 tabular-nums">
            {formatCurrency(item.total)}
          </Text>
          <Text className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums">
            {porcentajeDelTotal.toFixed(0)}% del total
          </Text>
        </View>
      </View>

      {/* Barra de participación en ventas totales */}
      <View className="h-1.5 bg-gray-200 dark:bg-neutral-600 rounded-full overflow-hidden">
        <View
          className="h-full bg-orange-500 rounded-full"
          style={{ width: `${porcentajeDelTotal}%` }}
        />
      </View>
    </Animated.View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

/** Cuántos usuarios mostrar antes del botón "Ver más" */
const MAX_VISIBLE = 5;

interface VentasPorUsuarioProps {
  data: VentasPorUsuarioType[];
}

export default function VentasPorUsuario({ data }: VentasPorUsuarioProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = data.length > MAX_VISIBLE;
  const visibleData = expanded || !hasMore ? data : data.slice(0, MAX_VISIBLE);
  const remainingCount = data.length - MAX_VISIBLE;

  // Total general para calcular el % de cada vendedor
  const totalGeneral = data.reduce((sum, u) => sum + u.total, 0);

  const handleVerMas = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpanded(true);
  }, []);

  return (
    <SectionCard title="Ventas por Usuario">
      {data.length === 0 ? (
        <EmptyState
          message="Sin datos en este período"
          iconName="person.2.fill"
        />
      ) : (
        <>
          {/* Siempre en columna — el layout 2-col está en el padre (index.tsx) */}
          <View className="gap-2">
            {visibleData.map((item, index) => (
              <VentasPorUsuarioRow
                key={item.usuario_id}
                item={item}
                index={index}
                porcentajeDelTotal={
                  totalGeneral > 0 ? (item.total / totalGeneral) * 100 : 0
                }
              />
            ))}
          </View>

          {hasMore && !expanded ? (
            <Pressable
              onPress={handleVerMas}
              className="mt-3 flex-row items-center justify-center gap-2 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 active:opacity-90"
            >
              <Text className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                Ver más ({remainingCount} más)
              </Text>
              <IconSymbol name="chevron.down" size={14} color="#ea580c" />
            </Pressable>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}
