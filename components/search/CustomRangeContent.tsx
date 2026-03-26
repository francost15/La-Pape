import type { RangoFechas } from "@/interface";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const MONTH_FULL = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAY_HEADERS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function formatDateShort(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function formatDateA11y(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
      now.getFullYear() === viewYear && now.getMonth() === viewMonth && now.getDate() === day;

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
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const currentYear = now.getFullYear();
  const yearsList = useMemo(() => {
    const yearStart = currentYear - 10;
    return Array.from({ length: 21 }, (_, i) => yearStart + i);
  }, [currentYear]);
  const blanks = useMemo(
    () => Array.from({ length: firstDayOfWeek }, (_, i) => i),
    [firstDayOfWeek]
  );
  const daysList = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  if (calendarView === "years") {
    return (
      <View className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-900">
        <Pressable
          onPress={() => setCalendarView("days")}
          className="mb-3 items-center"
          accessibilityRole="button"
          accessibilityLabel="Volver al calendario de días"
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
                onPress={() => {
                  setViewYear(y);
                  setCalendarView("months");
                }}
                className={`rounded-xl px-3 py-2 ${
                  active ? "bg-orange-600" : "bg-white dark:bg-neutral-800"
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Año ${y}`}
                accessibilityState={{ selected: active }}
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

  if (calendarView === "months") {
    return (
      <View className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-900">
        <Pressable
          onPress={() => setCalendarView("years")}
          className="mb-3 items-center"
          accessibilityRole="button"
          accessibilityLabel="Seleccionar año"
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
                onPress={() => {
                  setViewMonth(idx);
                  setCalendarView("days");
                }}
                style={{ width: "31%" }}
                className={`items-center rounded-xl py-2.5 ${
                  active ? "bg-orange-600" : "bg-white dark:bg-neutral-800"
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Mes ${MONTH_FULL[idx]} de ${viewYear}`}
                accessibilityState={{ selected: active }}
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

  return (
    <View className="rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-900">
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => navigateMonth(-1)}
          className="h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-neutral-800"
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
        >
          <Text className="text-lg font-bold text-gray-600 dark:text-gray-300">‹</Text>
        </Pressable>
        <Pressable
          onPress={() => setCalendarView("months")}
          accessibilityRole="button"
          accessibilityLabel="Cambiar mes"
          accessibilityHint="Abre la selección de mes"
        >
          <Text className="text-[15px] font-bold text-gray-800 dark:text-gray-100">
            {MONTH_FULL[viewMonth]} {viewYear}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigateMonth(1)}
          className="h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-neutral-800"
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
        >
          <Text className="text-lg font-bold text-gray-600 dark:text-gray-300">›</Text>
        </Pressable>
      </View>

      <View className="mb-1 flex-row">
        {DAY_HEADERS.map((d) => (
          <View key={d} style={{ width: "14.28%" }} className="items-center py-1">
            <Text className="text-[11px] font-semibold text-gray-400 uppercase dark:text-gray-500">
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {blanks.map((i) => (
          <View key={`b-${i}`} style={{ width: "14.28%", height: 38 }} />
        ))}
        {daysList.map((day) => {
          const { isStart, isEnd, inRange, isToday } = getDayStatus(day);
          const isEndpoint = isStart || isEnd;

          const rangeBg = inRange && !isEndpoint ? "bg-orange-100 dark:bg-orange-900/25" : "";

          const startEdge =
            isStart && rango.fin ? "rounded-l-full bg-orange-100 dark:bg-orange-900/25" : "";
          const endEdge =
            isEnd && rango.inicio ? "rounded-r-full bg-orange-100 dark:bg-orange-900/25" : "";
          const edgeBg = startEdge || endEdge;

          return (
            <View
              key={day}
              style={{ width: "14.28%", height: 38 }}
              className={`items-center justify-center ${rangeBg} ${edgeBg}`}
            >
              <Pressable
                onPress={() => handleDayPress(day)}
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isEndpoint
                    ? "bg-orange-600"
                    : isToday
                      ? "border border-orange-400 dark:border-orange-500"
                      : ""
                }`}
                accessibilityRole="button"
                accessibilityLabel={formatDateA11y(new Date(viewYear, viewMonth, day))}
                accessibilityHint="Selecciona esta fecha para el rango personalizado"
                accessibilityState={{ selected: isEndpoint }}
              >
                <Text
                  className={`text-[13px] ${
                    isEndpoint
                      ? "font-bold text-white"
                      : isToday
                        ? "font-bold text-orange-600 dark:text-orange-400"
                        : inRange
                          ? "font-medium text-orange-700 dark:text-orange-300"
                          : "font-medium text-gray-700 dark:text-gray-300"
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

// ─── Custom Range Content ────────────────────────────────────────────

export interface CustomRangeContentProps {
  rangoTemporal: RangoFechas;
  onRangoChange: (rango: RangoFechas) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isMobile: boolean;
}

export default function CustomRangeContent({
  rangoTemporal,
  onRangoChange,
  onConfirm,
  onCancel,
  isMobile,
}: CustomRangeContentProps) {
  const canConfirm = Boolean(rangoTemporal.inicio && rangoTemporal.fin);

  const selectingStep = !rangoTemporal.inicio ? "inicio" : !rangoTemporal.fin ? "fin" : "done";

  return (
    <>
      <Text
        className={`text-center font-bold text-gray-800 dark:text-gray-100 ${
          isMobile ? "mb-1 text-lg" : "mb-1 text-xl"
        }`}
        accessibilityRole="header"
      >
        Período Personalizado
      </Text>

      <Text className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
        {selectingStep === "inicio" && "Selecciona la fecha de inicio"}
        {selectingStep === "fin" && "Ahora selecciona la fecha de fin"}
        {selectingStep === "done" && "Toca un día para reiniciar la selección"}
      </Text>

      <View className="mb-4 flex-row gap-2">
        <View
          className={`flex-1 rounded-xl border px-3 py-2.5 ${
            selectingStep === "inicio"
              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
              : "border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
          }`}
        >
          <Text className="mb-0.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
            Desde
          </Text>
          <Text
            className={`text-sm font-bold ${
              rangoTemporal.inicio
                ? "text-gray-800 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {formatDateShort(rangoTemporal.inicio)}
          </Text>
        </View>

        <View className="justify-center">
          <Text className="font-medium text-gray-400 dark:text-gray-500">→</Text>
        </View>

        <View
          className={`flex-1 rounded-xl border px-3 py-2.5 ${
            selectingStep === "fin"
              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
              : "border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
          }`}
        >
          <Text className="mb-0.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
            Hasta
          </Text>
          <Text
            className={`text-sm font-bold ${
              rangoTemporal.fin
                ? "text-gray-800 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {formatDateShort(rangoTemporal.fin)}
          </Text>
        </View>
      </View>

      <View className="mb-5">
        <RangeCalendar rango={rangoTemporal} onRangoChange={onRangoChange} />
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onCancel}
          className="flex-1 items-center justify-center rounded-2xl bg-gray-100 py-3.5 dark:bg-neutral-700"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          accessibilityRole="button"
          accessibilityLabel="Cancelar selección de período"
        >
          <Text className="text-[15px] font-semibold text-gray-700 dark:text-gray-200">
            Cancelar
          </Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={!canConfirm}
          className="flex-1 items-center justify-center rounded-2xl bg-orange-600 py-3.5"
          style={({ pressed }) => ({
            opacity: canConfirm ? (pressed ? 0.8 : 1) : 0.4,
          })}
          accessibilityRole="button"
          accessibilityLabel="Confirmar período personalizado"
          accessibilityHint="Aplica el rango de fechas seleccionado"
        >
          <Text className="text-[15px] font-semibold text-white">Confirmar</Text>
        </Pressable>
      </View>
    </>
  );
}
