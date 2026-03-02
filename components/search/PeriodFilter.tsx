import { useLayoutStore } from "@/store/layout-store";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import CustomRangeContent from "./CustomRangeContent";
import PeriodBadges from "./PeriodBadges";

export type Periodo = "semana" | "mes" | "año" | "personalizado";

export interface RangoFechas {
  inicio: Date | null;
  fin: Date | null;
}

export interface PeriodFilterProps {
  periodo: Periodo;
  onPeriodoChange: (periodo: Periodo) => void;
  rangoPersonalizado?: RangoFechas;
  onRangoPersonalizadoChange?: (rango: RangoFechas) => void;
  formatDate?: (date: Date | null) => string;
}

const shortFormatDate = (date: Date | null): string => {
  if (!date) return "Seleccionar";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ─── Modals ──────────────────────────────────────────────────────────

function MobileModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <Pressable className="flex-1" onPress={onClose} />
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(180)}
          exiting={SlideOutDown.duration(200)}
        >
          <View className="bg-white dark:bg-neutral-800 rounded-t-3xl">
            <View className="w-10 h-1 bg-gray-300 dark:bg-neutral-600 rounded-full self-center mt-3 mb-1" />
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingTop: 12 }}
              style={{ maxHeight: 560 }}
            >
              {children}
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function DesktopModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(150)}
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0"
          onPress={onClose}
        />
        <Animated.View
          entering={ZoomIn.duration(250).springify().damping(18)}
          exiting={ZoomOut.duration(150)}
          className="w-full max-w-md"
        >
          <View
            className="bg-white dark:bg-neutral-800 rounded-3xl mx-4 overflow-hidden"
            style={
              Platform.OS === "web"
                ? { boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }
                : { elevation: 24 }
            }
          >
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24 }}
              style={{ maxHeight: 560 }}
            >
              {children}
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function PeriodFilter({
  periodo,
  onPeriodoChange,
  rangoPersonalizado,
  onRangoPersonalizadoChange,
  formatDate = shortFormatDate,
}: PeriodFilterProps) {
  const isMobile = useLayoutStore((s) => s.isMobile);
  const [showModal, setShowModal] = useState(false);
  const [rangoTemporal, setRangoTemporal] = useState<RangoFechas>({
    inicio: rangoPersonalizado?.inicio || null,
    fin: rangoPersonalizado?.fin || null,
  });

  useEffect(() => {
    if (rangoPersonalizado) setRangoTemporal(rangoPersonalizado);
  }, [rangoPersonalizado]);

  const handleSelect = useCallback(
    (p: Periodo) => {
      if (p === "personalizado") {
        setShowModal(true);
      } else {
        onPeriodoChange(p);
        onRangoPersonalizadoChange?.({ inicio: null, fin: null });
      }
    },
    [onPeriodoChange, onRangoPersonalizadoChange],
  );

  const handleCloseModal = useCallback(() => setShowModal(false), []);

  const handleConfirm = useCallback(() => {
    if (
      rangoTemporal.inicio &&
      rangoTemporal.fin &&
      rangoTemporal.inicio <= rangoTemporal.fin
    ) {
      onRangoPersonalizadoChange?.(rangoTemporal);
      onPeriodoChange("personalizado");
      setShowModal(false);
    }
  }, [rangoTemporal, onPeriodoChange, onRangoPersonalizadoChange]);

  const hasCustomRange =
    periodo === "personalizado" &&
    rangoPersonalizado?.inicio &&
    rangoPersonalizado?.fin;

  const ModalWrapper = isMobile ? MobileModal : DesktopModal;

  return (
    <>
      <View
        className={`mb-6 ${
          isMobile ? "w-full" : "w-full max-w-md self-center"
        }`}
      >
        <PeriodBadges
          periodo={periodo}
          onSelect={handleSelect}
          isMobile={isMobile}
        />

        {hasCustomRange && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <Pressable
              onPress={() => setShowModal(true)}
              className="mt-3 flex-row items-center justify-center gap-2 py-2 px-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40"
            >
              <Text className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {formatDate(rangoPersonalizado.inicio)} — {formatDate(rangoPersonalizado.fin)}
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </View>

      <ModalWrapper visible={showModal} onClose={handleCloseModal}>
        <CustomRangeContent
          rangoTemporal={rangoTemporal}
          onRangoChange={setRangoTemporal}
          onConfirm={handleConfirm}
          onCancel={handleCloseModal}
          isMobile={isMobile}
        />
      </ModalWrapper>
    </>
  );
}
