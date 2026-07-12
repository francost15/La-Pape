import { BottomSheetModal } from "@/components/ui/BottomSheetModal";
import { CenteredModal } from "@/components/ui/CenteredModal";
import type { Periodo, RangoFechas } from "@/interface";
import type { PeriodFilterProps } from "@/interface/product-search";
import { formatDate as formatDateUtil } from "@/lib/utils/format";
import { useLayoutStore } from "@/store/layout-store";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated";
import CustomRangeContent from "./CustomRangeContent";
import PeriodBadges from "./PeriodBadges";

// Dos variantes de modal: mobile usa slide-up desde abajo (UX móvil nativa);
// desktop usa zoom centrado para no ocupar toda la pantalla. Ambos son los
// shells compartidos BottomSheetModal/CenteredModal.

function PeriodModal({
  isMobile,
  visible,
  onClose,
  children,
}: {
  isMobile: boolean;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const content = (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: isMobile ? 20 : 24, paddingTop: isMobile ? 12 : 24 }}
    >
      {children}
    </ScrollView>
  );

  return isMobile ? (
    <BottomSheetModal visible={visible} onClose={onClose} closeLabel="Cerrar selector de período">
      {content}
    </BottomSheetModal>
  ) : (
    <CenteredModal visible={visible} onClose={onClose} closeLabel="Cerrar selector de período">
      {content}
    </CenteredModal>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function PeriodFilter({
  periodo,
  onPeriodoChange,
  rangoPersonalizado,
  onRangoPersonalizadoChange,
  formatDate = (d) => formatDateUtil(d, "Seleccionar"),
}: PeriodFilterProps) {
  const isMobile = useLayoutStore((s) => s.isMobile);
  const [showModal, setShowModal] = useState(false);
  const [rangoTemporal, setRangoTemporal] = useState<RangoFechas>({
    inicio: rangoPersonalizado?.inicio || null,
    fin: rangoPersonalizado?.fin || null,
  });

  const handleSelect = useCallback(
    (p: Periodo) => {
      if (p === "personalizado") {
        setRangoTemporal(rangoPersonalizado ?? { inicio: null, fin: null });
        setShowModal(true);
      } else {
        onPeriodoChange(p);
        onRangoPersonalizadoChange?.({ inicio: null, fin: null });
      }
    },
    [onPeriodoChange, onRangoPersonalizadoChange, rangoPersonalizado]
  );

  const handleCloseModal = useCallback(() => setShowModal(false), []);

  const handleConfirm = useCallback(() => {
    if (rangoTemporal.inicio && rangoTemporal.fin && rangoTemporal.inicio <= rangoTemporal.fin) {
      onRangoPersonalizadoChange?.(rangoTemporal);
      onPeriodoChange("personalizado");
      setShowModal(false);
    }
  }, [rangoTemporal, onPeriodoChange, onRangoPersonalizadoChange]);

  // RN Core: ternario evita crash si valor fuera falsy; mostrar chip solo cuando hay rango válido
  const hasCustomRange = Boolean(
    periodo === "personalizado" && rangoPersonalizado?.inicio && rangoPersonalizado?.fin
  );

  return (
    <>
      <View className="mb-4 items-center" style={!isMobile ? { alignSelf: "center" } : undefined}>
        <PeriodBadges periodo={periodo} onSelect={handleSelect} isMobile={isMobile} />

        {hasCustomRange ? (
          <Animated.View
            entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
          >
            <Pressable
              onPress={() => setShowModal(true)}
              className="mt-2 flex-row items-center gap-1.5 rounded-lg border border-orange-200/60 bg-orange-50 px-3 py-1.5 dark:border-orange-800/30 dark:bg-orange-900/20"
              accessibilityRole="button"
              accessibilityLabel="Editar período personalizado"
              accessibilityHint="Abre el modal para cambiar fecha de inicio y fin"
            >
              <Text className="text-[12px] font-medium text-orange-600 dark:text-orange-400">
                {formatDate(rangoPersonalizado!.inicio)} — {formatDate(rangoPersonalizado!.fin)}
              </Text>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>

      <PeriodModal isMobile={isMobile} visible={showModal} onClose={handleCloseModal}>
        <CustomRangeContent
          rangoTemporal={rangoTemporal}
          onRangoChange={setRangoTemporal}
          onConfirm={handleConfirm}
          onCancel={handleCloseModal}
          isMobile={isMobile}
        />
      </PeriodModal>
    </>
  );
}
