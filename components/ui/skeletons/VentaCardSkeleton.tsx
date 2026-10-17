import { AppColors } from "@/constants/colors";
import type { HistoryListSkeletonProps } from "@/interface/ui";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { View } from "react-native";
import { Bone } from "./Bone";

/**
 * VentaCardSkeleton — espeja VentaCard colapsada: card blanca rounded-2xl con
 * barra de acento izquierda (3px), fila px-5 py-5 con hora + nº de productos a
 * la izquierda, total y chevron circular a la derecha. Mismas alturas para que
 * el swap por datos reales no desplace el scroll.
 */
function VentaCardSkeleton() {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      className="overflow-hidden rounded-2xl bg-surface-elevated"
      style={{
        boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
      }}
    >
      <View
        className="border-l-[3px]"
        style={{ borderLeftColor: isDark ? AppColors.dark.border : "rgba(0,0,0,0.08)" }}
      >
        <View className="flex-row items-center justify-between px-5 py-5">
          <View className="min-w-0 flex-1 gap-1.5">
            <Bone width={56} height={10} />
            <Bone width={96} height={13} />
          </View>
          <View className="mr-4">
            <Bone width={88} height={22} />
          </View>
          <Bone width={32} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}

/**
 * Lista agrupada para el historial: barra de encabezado de sección (acento +
 * etiqueta + total) seguida de N cards, igual que la SectionList real.
 */
export function HistoryListSkeleton({ groups = 2, cardsPerGroup = 3 }: HistoryListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: groups }, (_, g) => (
        <View key={g}>
          {/* Encabezado de sección: mismo ritmo vertical (mt-8 mb-4 py-2) que el real */}
          <View className="mt-8 mb-4 flex-row items-center justify-between py-2">
            <View className="flex-row items-center gap-3">
              <Bone width={2.5} height={16} borderRadius={2} />
              <Bone width={64} height={12} />
            </View>
            <Bone width={72} height={14} />
          </View>
          {Array.from({ length: cardsPerGroup }, (_, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <VentaCardSkeleton />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
