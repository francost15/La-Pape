import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLayoutStore } from "@/store/layout-store";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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

const PERIODOS: Periodo[] = ["semana", "mes", "año", "personalizado"];

const LABELS: Record<Periodo, string> = {
  semana: "Semana",
  mes: "Mes",
  año: "Año",
  personalizado: "Personalizado",
};

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const MONTH_FULL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_HEADERS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const SPRING_CONFIG = { damping: 18, stiffness: 200, mass: 0.8 };

const defaultFormatDate = (date: Date | null): string => {
  if (!date) return "—";
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

const shortFormatDate = (date: Date | null): string => {
  if (!date) return "Seleccionar";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function sameDay(a: Date | null, b: Date): boolean {
  if (!a) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateOnly(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// ─── Period Badges ───────────────────────────────────────────────────

function PeriodBadges({
  periodo,
  onSelect,
  isMobile,
}: {
  periodo: Periodo;
  onSelect: (p: Periodo) => void;
  isMobile: boolean;
}) {
  const colorScheme = useColorScheme();
  const isDark = (colorScheme ?? "light") === "dark";

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  const layoutsRef = useRef<Record<string, { x: number; width: number }>>({});
  const initializedRef = useRef(false);

  const syncIndicator = useCallback(
    (p: Periodo, animate: boolean) => {
      const layout = layoutsRef.current[p];
      if (!layout) return;
      if (animate) {
        indicatorX.value = withSpring(layout.x, SPRING_CONFIG);
        indicatorW.value = withSpring(layout.width, SPRING_CONFIG);
      } else {
        indicatorX.value = layout.x;
        indicatorW.value = layout.width;
      }
    },
    [indicatorX, indicatorW],
  );

  const handleLayout = useCallback(
    (p: Periodo) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      layoutsRef.current[p] = { x, width };
      if (!initializedRef.current) {
        const allMeasured = PERIODOS.every((k) => layoutsRef.current[k]);
        if (allMeasured) {
          initializedRef.current = true;
          syncIndicator(periodo, false);
        }
      }
    },
    [periodo, syncIndicator],
  );

  useEffect(() => {
    if (initializedRef.current) syncIndicator(periodo, true);
  }, [periodo, syncIndicator]);

  const indicatorStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    left: indicatorX.value,
    width: indicatorW.value,
    top: 0,
    bottom: 0,
    borderRadius: isMobile ? 10 : 12,
  }));

  const handlePress = useCallback(
    (p: Periodo) => {
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(p);
    },
    [onSelect],
  );

  return (
    <View
      className={`flex-row relative ${
        isMobile
          ? "rounded-xl p-1 bg-gray-100 dark:bg-neutral-800"
          : "rounded-2xl p-1.5 bg-gray-100 dark:bg-neutral-800/80"
      }`}
    >
      <Animated.View
        style={[
          indicatorStyle,
          {
            backgroundColor: "#ea580c",
            ...(Platform.OS === "web"
              ? { boxShadow: "0 2px 8px rgba(234,88,12,0.35)" }
              : {
                  shadowColor: "#ea580c",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.5 : 0.35,
                  shadowRadius: 6,
                  elevation: 4,
                }),
          },
        ]}
      />
      {PERIODOS.map((p) => {
        const isSelected = periodo === p;
        return (
          <Pressable
            key={p}
            onLayout={handleLayout(p)}
            onPress={() => handlePress(p)}
            style={{ flex: 1, zIndex: 1 }}
            className={`items-center justify-center ${
              isMobile ? "py-2.5" : "py-3 px-5"
            }`}
            accessibilityLabel={`Filtrar por ${LABELS[p]}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className={`font-semibold ${isMobile ? "text-[13px]" : "text-sm"} ${
                isSelected
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {LABELS[p]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Range Calendar ──────────────────────────────────────────────────

type CalendarView = "days" | "months" | "years";

function RangeCalendar({
  rango,
  onRangoChange,
}: {
  rango: RangoFechas;
  onRangoChange: (r: RangoFechas) => void;
}) {
  const now = new Date();
  const ref = rango.inicio || now;

  const [viewYear, setViewYear] = useState(ref.getFullYear());
  const [viewMonth, setViewMonth] = useState(ref.getMonth());
  const [calendarView, setCalendarView] = useState<CalendarView>("days");
  const [selectingEnd, setSelectingEnd] = useState(false);

  useEffect(() => {
    if (rango.inicio && !selectingEnd) {
      setViewYear(rango.inicio.getFullYear());
      setViewMonth(rango.inicio.getMonth());
    }
  }, [rango.inicio, selectingEnd]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const handleDayPress = (day: number) => {
    const tapped = new Date(viewYear, viewMonth, day);

    if (!rango.inicio || (rango.inicio && rango.fin)) {
      onRangoChange({ inicio: tapped, fin: null });
      setSelectingEnd(true);
      return;
    }

    if (tapped < rango.inicio) {
      onRangoChange({ inicio: tapped, fin: null });
      setSelectingEnd(true);
      return;
    }

    onRangoChange({ inicio: rango.inicio, fin: tapped });
    setSelectingEnd(false);
  };

  const getDayStatus = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const dOnly = toDateOnly(d);
    const isStart = sameDay(rango.inicio, d);
    const isEnd = sameDay(rango.fin, d);
    const isToday =
      now.getFullYear() === viewYear &&
      now.getMonth() === viewMonth &&
      now.getDate() === day;

    let inRange = false;
    if (rango.inicio && rango.fin) {
      const s = toDateOnly(rango.inicio);
      const e = toDateOnly(rango.fin);
      inRange = dOnly >= s && dOnly <= e;
    }

    return { isStart, isEnd, inRange, isToday };
  };

  const navigateMonth = (delta: number) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    else if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  };

  const yearStart = now.getFullYear() - 10;
  const yearsList = Array.from({ length: 21 }, (_, i) => yearStart + i);

  // ── Years view ──
  if (calendarView === "years") {
    return (
      <View className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-3">
        <Pressable
          onPress={() => setCalendarView("days")}
          className="items-center mb-3"
        >
          <Text className="text-base font-bold text-orange-600 dark:text-orange-400">
            Seleccionar Año
          </Text>
        </Pressable>
        <View className="flex-row flex-wrap justify-center gap-2">
          {yearsList.map((y) => {
            const active = y === viewYear;
            return (
              <Pressable
                key={y}
                onPress={() => { setViewYear(y); setCalendarView("months"); }}
                className={`py-2 px-3 rounded-xl ${
                  active ? "bg-orange-600" : "bg-white dark:bg-neutral-800"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    active ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {y}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // ── Months view ──
  if (calendarView === "months") {
    return (
      <View className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-3">
        <Pressable
          onPress={() => setCalendarView("years")}
          className="items-center mb-3"
        >
          <Text className="text-base font-bold text-orange-600 dark:text-orange-400">
            {viewYear}
          </Text>
        </Pressable>
        <View className="flex-row flex-wrap gap-2">
          {MONTH_NAMES.map((m, idx) => {
            const active = idx === viewMonth;
            return (
              <Pressable
                key={m}
                onPress={() => { setViewMonth(idx); setCalendarView("days"); }}
                style={{ width: "31%" }}
                className={`py-2.5 items-center rounded-xl ${
                  active ? "bg-orange-600" : "bg-white dark:bg-neutral-800"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    active ? "text-white" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {m}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  // ── Days view ──
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const daysList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <View className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-3">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Pressable
          onPress={() => navigateMonth(-1)}
          className="w-9 h-9 items-center justify-center rounded-xl bg-white dark:bg-neutral-800"
        >
          <Text className="text-gray-600 dark:text-gray-300 text-lg font-bold">‹</Text>
        </Pressable>
        <Pressable onPress={() => setCalendarView("months")}>
          <Text className="text-[15px] font-bold text-gray-800 dark:text-gray-100">
            {MONTH_FULL[viewMonth]} {viewYear}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigateMonth(1)}
          className="w-9 h-9 items-center justify-center rounded-xl bg-white dark:bg-neutral-800"
        >
          <Text className="text-gray-600 dark:text-gray-300 text-lg font-bold">›</Text>
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View className="flex-row mb-1">
        {DAY_HEADERS.map((d) => (
          <View key={d} style={{ width: "14.28%" }} className="items-center py-1">
            <Text className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase">
              {d}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View className="flex-row flex-wrap">
        {blanks.map((i) => (
          <View key={`b-${i}`} style={{ width: "14.28%", height: 38 }} />
        ))}
        {daysList.map((day) => {
          const { isStart, isEnd, inRange, isToday } = getDayStatus(day);
          const isEndpoint = isStart || isEnd;

          const rangeBg = inRange && !isEndpoint
            ? "bg-orange-100 dark:bg-orange-900/25"
            : "";

          const startEdge = isStart && rango.fin ? "rounded-l-full bg-orange-100 dark:bg-orange-900/25" : "";
          const endEdge = isEnd && rango.inicio ? "rounded-r-full bg-orange-100 dark:bg-orange-900/25" : "";
          const edgeBg = startEdge || endEdge;

          return (
            <View
              key={day}
              style={{ width: "14.28%", height: 38 }}
              className={`justify-center items-center ${rangeBg} ${edgeBg}`}
            >
              <Pressable
                onPress={() => handleDayPress(day)}
                className={`w-9 h-9 items-center justify-center rounded-full ${
                  isEndpoint
                    ? "bg-orange-600"
                    : isToday
                      ? "border border-orange-400 dark:border-orange-500"
                      : ""
                }`}
              >
                <Text
                  className={`text-[13px] ${
                    isEndpoint
                      ? "text-white font-bold"
                      : isToday
                        ? "text-orange-600 dark:text-orange-400 font-bold"
                        : inRange
                          ? "text-orange-700 dark:text-orange-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 font-medium"
                  }`}
                >
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

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

// ─── Custom Period Content ───────────────────────────────────────────

function CustomPeriodContent({
  rangoTemporal,
  onRangoChange,
  onConfirm,
  onCancel,
  isMobile,
}: {
  rangoTemporal: RangoFechas;
  onRangoChange: (rango: RangoFechas) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isMobile: boolean;
}) {
  const canConfirm = rangoTemporal.inicio && rangoTemporal.fin;

  const selectingStep = !rangoTemporal.inicio
    ? "inicio"
    : !rangoTemporal.fin
      ? "fin"
      : "done";

  return (
    <>
      <Text
        className={`font-bold text-gray-800 dark:text-gray-100 text-center ${
          isMobile ? "text-lg mb-1" : "text-xl mb-1"
        }`}
      >
        Período Personalizado
      </Text>

      <Text className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
        {selectingStep === "inicio" && "Selecciona la fecha de inicio"}
        {selectingStep === "fin" && "Ahora selecciona la fecha de fin"}
        {selectingStep === "done" && "Toca un día para reiniciar la selección"}
      </Text>

      {/* Range summary pills */}
      <View className="flex-row gap-2 mb-4">
        <View
          className={`flex-1 py-2.5 px-3 rounded-xl border ${
            selectingStep === "inicio"
              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
              : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
          }`}
        >
          <Text className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
            Desde
          </Text>
          <Text
            className={`text-sm font-bold ${
              rangoTemporal.inicio
                ? "text-gray-800 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {defaultFormatDate(rangoTemporal.inicio)}
          </Text>
        </View>

        <View className="justify-center">
          <Text className="text-gray-400 dark:text-gray-500 font-medium">→</Text>
        </View>

        <View
          className={`flex-1 py-2.5 px-3 rounded-xl border ${
            selectingStep === "fin"
              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
              : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
          }`}
        >
          <Text className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
            Hasta
          </Text>
          <Text
            className={`text-sm font-bold ${
              rangoTemporal.fin
                ? "text-gray-800 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {defaultFormatDate(rangoTemporal.fin)}
          </Text>
        </View>
      </View>

      {/* Unified calendar */}
      <View className="mb-5">
        <RangeCalendar rango={rangoTemporal} onRangoChange={onRangoChange} />
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 bg-gray-100 dark:bg-neutral-700 rounded-2xl py-3.5 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 dark:text-gray-200 font-semibold text-[15px]">
            Cancelar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          className="flex-1 bg-orange-600 rounded-2xl py-3.5 items-center"
          disabled={!canConfirm}
          activeOpacity={0.8}
          style={{ opacity: canConfirm ? 1 : 0.4 }}
        >
          <Text className="text-white font-semibold text-[15px]">
            Confirmar
          </Text>
        </TouchableOpacity>
      </View>
    </>
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
        <CustomPeriodContent
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
