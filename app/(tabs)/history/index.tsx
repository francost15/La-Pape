import VentaCard from "@/components/history/VentaCard";
import PeriodFilter from "@/components/search/PeriodFilter";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import ConfirmAlert from "@/components/ui/ConfirmAlert";
import EmptyState from "@/components/ui/EmptyState";
import { AppColors } from "@/constants/colors";
import { Strings } from "@/constants/strings";
import { AppFonts } from "@/constants/typography";
import { useHistory } from "@/hooks/use-history";
import { Venta, VentaDetalle } from "@/interface";
import { formatCurrency } from "@/lib/utils/format";
import { useCallback, useMemo } from "react";
import { SectionList, Text, useWindowDimensions, View } from "react-native";
import { HistoryListSkeleton } from "@/components/ui/skeletons";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const {
    loading,
    error,
    sections,
    ventasFiltradas,
    productNames,
    expandedIds,
    refundTarget,
    refunding,
    periodo,
    setPeriodo,
    rangoPersonalizado,
    setRangoPersonalizado,
    toggleCard,
    handleVerRecibo,
    handleReembolso,
    handleConfirmRefund,
    cancelRefund,
  } = useHistory();

  /**
   * Section headers — Digital Atelier style.
   * No card wrapper. Just bold text with accent bar and total.
   */
  const renderSectionHeader = useCallback(
    ({ section }: { section: { label: string; total: number } }) => {
      const isTodayOrYesterday = section.label === "Hoy" || section.label === "Ayer";
      return (
        <Animated.View
          entering={FadeIn.duration(320).reduceMotion(ReduceMotion.System)}
          className="mt-8 mb-4 flex-row items-baseline justify-between py-2"
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-4 w-[2.5px] rounded-full"
              style={{
                backgroundColor: isTodayOrYesterday ? AppColors.primary : "#D4D4D4",
              }}
            />
            <Text
              className={`text-[12px] font-bold tracking-[0.2em] uppercase ${
                isTodayOrYesterday ? "text-accent" : "text-content-secondary"
              }`}
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              {section.label}
            </Text>
          </View>
          <Text
            className="text-[14px] font-bold text-content-primary tabular-nums"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            {formatCurrency(section.total)}
          </Text>
        </Animated.View>
      );
    },
    []
  );

  const renderVentaItem = useCallback(
    ({ item }: { item: { venta: Venta; detalles: VentaDetalle[]; fecha: Date } }) => (
      <View style={{ marginBottom: 8 }}>
        <VentaCard
          venta={item.venta}
          detalles={item.detalles}
          fecha={item.fecha}
          isReembolso={item.venta.estado === "REEMBOLSO"}
          expandido={expandedIds.includes(item.venta.id)}
          productNames={productNames}
          onToggle={() => toggleCard(item.venta.id)}
          onVerRecibo={handleVerRecibo}
          onReembolso={handleReembolso}
        />
      </View>
    ),
    [expandedIds, productNames, toggleCard, handleVerRecibo, handleReembolso]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View className={isTablet ? "mx-auto w-full max-w-2xl pb-2" : "pb-2"}>
        <PeriodFilter
          periodo={periodo}
          onPeriodoChange={setPeriodo}
          rangoPersonalizado={rangoPersonalizado}
          onRangoPersonalizadoChange={setRangoPersonalizado}
        />
      </View>
    ),
    [isTablet, periodo, setPeriodo, rangoPersonalizado, setRangoPersonalizado]
  );

  const ListEmptyComponent = useMemo(
    () => (
      <Animated.View
        entering={FadeIn.duration(400).reduceMotion(ReduceMotion.System)}
        className="mt-20 px-10"
      >
        <EmptyState
          icon="clock"
          title={Strings.history.emptySales}
          description={Strings.history.emptySalesHint}
        />
      </Animated.View>
    ),
    []
  );

  if (loading) {
    // Skeleton con el mismo padding que la SectionList real para que el swap
    // a datos no produzca salto de layout
    return (
      <View
        className="flex-1 bg-canvas"
        style={{ paddingHorizontal: isTablet ? 32 : 16, paddingTop: 16 }}
      >
        <HistoryListSkeleton groups={2} cardsPerGroup={3} />
      </View>
    );
  }

  if (error) {
    return (
      <AnimatedScreen>
        <View className="flex-1 items-center justify-center bg-canvas px-8">
          <EmptyState
            icon="error"
            title={error}
            description={Strings.errors.connection}
            iconColor={AppColors.errorLight}
          />
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.venta.id}
        renderItem={renderVentaItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ventasFiltradas.length === 0 ? ListEmptyComponent : undefined}
        className="flex-1 bg-canvas"
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 32 : 16,
          paddingTop: 16,
          paddingBottom: 140,
        }}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      <ConfirmAlert
        visible={!!refundTarget}
        title={Strings.history.refundConfirm}
        message={
          refundTarget
            ? `¿Reembolsar la venta por ${formatCurrency(refundTarget.total)}? Se devolverá el stock de los productos.`
            : ""
        }
        confirmText={refunding ? Strings.history.processingRefund : Strings.history.refund}
        cancelText={Strings.common.cancel}
        onConfirm={handleConfirmRefund}
        onCancel={cancelRefund}
        danger
      />
    </AnimatedScreen>
  );
}
