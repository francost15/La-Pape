import type { ResumenSkeletonProps } from "@/interface/ui";
import React from "react";
import { View } from "react-native";
import { Bone } from "./Bone";

/**
 * Tile KPI — espeja KpiCard: rounded-[24px] bg-white p-6, barra de acento
 * vertical (3×32) y jerarquía label / valor grande (32px) / subtítulo.
 */
function KpiTileSkeleton() {
  return (
    <View className="min-w-[140px] flex-1 rounded-[24px] bg-surface-elevated p-6">
      <View className="flex-row items-start gap-4">
        <Bone width={3} height={32} borderRadius={2} className="mt-1" />
        <View className="flex-1">
          <Bone width={96} height={10} className="mb-2" />
          <Bone width="80%" height={30} />
          <Bone width={72} height={11} className="mt-2" />
        </View>
      </View>
    </View>
  );
}

/** Título de sección: barra 2×16 + etiqueta, mismo ritmo que SectionTitle real */
function SectionTitleSkeleton() {
  return (
    <View className="mt-4 mb-4 flex-row items-center gap-3">
      <Bone width={2} height={16} borderRadius={1} />
      <Bone width={120} height={10} />
    </View>
  );
}

/** Filas de una sección (vendedores / productos): avatar + texto + monto */
function SectionRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-3">
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} className="flex-row items-center gap-3 py-2">
          <Bone width={40} height={40} borderRadius={20} />
          <View className="min-w-0 flex-1 gap-1.5">
            <Bone width="55%" height={13} />
            <Bone width="35%" height={11} />
          </View>
          <Bone width={64} height={14} />
        </View>
      ))}
    </View>
  );
}

/**
 * ResumenSkeleton — espeja el layout real del dashboard: filtro de período,
 * grid de 3 KPIs y dos secciones (en desktop, lado a lado con los mismos
 * flex ratios 2/3 que la pantalla real).
 */
export function ResumenSkeleton({ isMobile }: ResumenSkeletonProps) {
  return (
    <View className="gap-6">
      {/* Placeholder del PeriodFilter (fila de chips) */}
      <View className="flex-row gap-2">
        <Bone width={72} height={34} borderRadius={17} />
        <Bone width={72} height={34} borderRadius={17} />
        <Bone width={72} height={34} borderRadius={17} />
        <Bone width={72} height={34} borderRadius={17} />
      </View>

      {/* KPIs ×3 — mismo contenedor que KpiGrid */}
      <View className={`mb-6 gap-6 ${isMobile ? "flex-row flex-wrap" : "flex-row"}`}>
        <KpiTileSkeleton />
        <KpiTileSkeleton />
        <KpiTileSkeleton />
      </View>

      {isMobile ? (
        <>
          <SectionTitleSkeleton />
          <SectionRowsSkeleton rows={3} />
          <SectionTitleSkeleton />
          <SectionRowsSkeleton rows={4} />
        </>
      ) : (
        <View className="flex-row items-start gap-6">
          <View style={{ flex: 2 }}>
            <SectionTitleSkeleton />
            <SectionRowsSkeleton rows={3} />
          </View>
          <View style={{ flex: 3 }}>
            <SectionTitleSkeleton />
            <SectionRowsSkeleton rows={4} />
          </View>
        </View>
      )}
    </View>
  );
}
