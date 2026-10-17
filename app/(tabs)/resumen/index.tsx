import CategoryBreakdown from "@/components/resumen/CategoryBreakdown";
import KpiGrid from "@/components/resumen/KpiGrid";
import ProductosBajoStockList from "@/components/resumen/ProductosBajoStockList";
import TopProductsList from "@/components/resumen/TopProductsList";
import VentasPorUsuario from "@/components/resumen/VentasPorUsuario";
import PeriodFilter from "@/components/search/PeriodFilter";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import AppText from "@/components/ui/AppText";
import EmptyState from "@/components/ui/EmptyState";
import { useResumen } from "@/hooks/use-resumen";
import { useSessionStore } from "@/store/session-store";
import { AppColors } from "@/constants/colors";
import { ResumenSkeleton } from "@/components/ui/skeletons";
import React from "react";
import { ScrollView, View } from "react-native";

export default function ResumenScreen() {
  const {
    loading,
    error,
    noNegocio,
    isMobile,
    periodo,
    setPeriodo,
    rangoPersonalizado,
    setRangoPersonalizado,
    metricas,
    ranking,
    categorias,
    ventasPorUsuario,
    productosBajoStock,
  } = useResumen();

  if (noNegocio) {
    return (
      <AnimatedScreen>
        <View className="flex-1 items-center justify-center bg-canvas px-8">
          <EmptyState
            icon="error"
            title={error ?? "No tienes un negocio asignado"}
            description="Pide a un administrador que te asigne un negocio. Desde aquí no se crea uno."
            iconColor={AppColors.light.textMuted}
          />
        </View>
      </AnimatedScreen>
    );
  }

  if (loading) {
    // Skeleton con el mismo padding que el ScrollView real: el contenido llega
    // exactamente donde estaban los placeholders, sin salto de layout
    return (
      <AnimatedScreen>
        <View
          className="flex-1 bg-canvas"
          style={{
            paddingHorizontal: isMobile ? 20 : 48,
            paddingVertical: isMobile ? 16 : 40,
          }}
        >
          <ResumenSkeleton isMobile={isMobile} />
        </View>
      </AnimatedScreen>
    );
  }

  if (error) {
    return (
      <AnimatedScreen>
        <View className="flex-1 items-center justify-center bg-canvas px-8">
          <EmptyState
            icon="error"
            title={error}
            description="Verifica tu conexión e intenta nuevamente"
            iconColor={AppColors.errorLight}
          />
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen>
      <ScrollView
        className="flex-1 bg-canvas"
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 20 : 48,
          paddingVertical: isMobile ? 16 : 40,
          paddingBottom: 140,
        }}
      >
        <View className="gap-6">
          <TenantLine />
          <PeriodFilter
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            rangoPersonalizado={rangoPersonalizado}
            onRangoPersonalizadoChange={setRangoPersonalizado}
          />

          <KpiGrid metricas={metricas} isMobile={isMobile} />

          {isMobile ? (
            <>
              <SectionTitle title="Ventas por Usuario" />
              <VentasPorUsuario data={ventasPorUsuario} />
              <SectionTitle title="Categorías" />
              <CategoryBreakdown data={categorias} isMobile={isMobile} />
            </>
          ) : (
            <View className="flex-row items-start gap-6">
              <View style={{ flex: 2 }}>
                <SectionTitle title="Ventas por Usuario" />
                <VentasPorUsuario data={ventasPorUsuario} />
              </View>
              <View style={{ flex: 3 }}>
                <SectionTitle title="Categorías" />
                <CategoryBreakdown data={categorias} isMobile={isMobile} />
              </View>
            </View>
          )}

          {isMobile ? (
            <>
              <SectionTitle title="Productos Más Vendidos" />
              <TopProductsList items={ranking.top} />
              <SectionTitle title="Bajo Stock" />
              <ProductosBajoStockList items={productosBajoStock} />
            </>
          ) : (
            <View className="flex-row items-start gap-6">
              <View style={{ flex: 3 }}>
                <SectionTitle title="Productos Más Vendidos" />
                <TopProductsList items={ranking.top} />
              </View>
              <View style={{ flex: 2 }}>
                <SectionTitle title="Bajo Stock" />
                <ProductosBajoStockList items={productosBajoStock} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </AnimatedScreen>
  );
}

function TenantLine() {
  const negocioNombre = useSessionStore((s) => s.negocioNombre);
  const sucursalNombre = useSessionStore((s) => s.sucursalNombre);
  const label = [negocioNombre, sucursalNombre].filter(Boolean).join(" · ");
  if (!label) return null;
  return <AppText variant="body">{label}</AppText>;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View className="mt-4 mb-4 flex-row items-center gap-3">
      <View className="h-4 w-[2px] bg-line-strong" />
      {/* Se conserva el tracking original (0.25em @10px) sobre el eyebrow canónico */}
      <AppText variant="eyebrow" style={{ letterSpacing: 2.5 }}>
        {title}
      </AppText>
    </View>
  );
}
