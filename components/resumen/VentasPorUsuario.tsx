import { ResumenRow } from "@/components/resumen/shared/ResumenRow";
import SectionCard from "@/components/resumen/shared/SectionCard";
import { UserAvatar } from "@/components/ui/UserAvatar";
import EmptyState from "@/components/ui/EmptyState";
import { useHaptic } from "@/hooks/use-haptic";
import { useStaggeredEntrance } from "@/hooks/use-staggered-entrance";
import type { VentasPorUsuarioProps, VentasPorUsuarioRowProps } from "@/interface/resumen";
import { formatCurrency, pluralize } from "@/lib/utils/format";
import React, { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

// ─── Row individual ───────────────────────────────────────────────────────────

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
  const animatedStyle = useStaggeredEntrance(index, { distance: 6, duration: 240 });

  return (
    <Animated.View style={animatedStyle}>
      <ResumenRow
        leading={<UserAvatar name={item.nombre} photoUri={item.foto} size={32} />}
        title={item.nombre}
        subtitle={`${item.transacciones} ${pluralize(item.transacciones, "venta", "ventas")}`}
        showDivider={showDivider}
        trailing={
          <View className="shrink-0 items-end">
            <Text className="text-[13px] font-bold text-content-primary tabular-nums">
              {formatCurrency(item.total)}
            </Text>
            <Text className="text-[10px] text-content-secondary tabular-nums">
              {porcentajeDelTotal.toFixed(0)}%
            </Text>
          </View>
        }
      >
        {/* Barra de participación: 2px, discreta */}
        <View className="mt-1.5 ml-11 h-0.5 overflow-hidden rounded-full bg-[#F5F5F4] dark:bg-[#1A1F2B]">
          <View
            className="h-full rounded-full bg-[#ea580c]"
            style={{ width: `${porcentajeDelTotal}%` }}
          />
        </View>
      </ResumenRow>
    </Animated.View>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const MAX_VISIBLE = 5;

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
        <EmptyState title="Sin datos en este período" iconName="person.2.fill" />
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
