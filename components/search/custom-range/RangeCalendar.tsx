import type { RangeCalendarProps } from "@/interface/product-search";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  DAY_HEADERS,
  MONTH_FULL,
  MONTH_NAMES,
  formatDateA11y,
  sameDay,
  toDateOnly,
  type CalendarView,
} from "./calendar-utils";

function getYearsAround(anchorYear: number): number[] {
  const yearStart = anchorYear - 10;
  return Array.from({ length: 21 }, (_, i) => yearStart + i);
}

export function RangeCalendar({ rango, onRangoChange }: RangeCalendarProps) {
  const now = new Date();
  const ref = rango.inicio || now;

  const [viewYear, setViewYear] = useState(ref.getFullYear());
  const [viewMonth, setViewMonth] = useState(ref.getMonth());
  const [calendarView, setCalendarView] = useState<CalendarView>("days");
  const selectingEnd = useRef(false);

  const inicioKey = rango.inicio?.getTime() ?? null;

  useEffect(() => {
    if (!rango.inicio || selectingEnd.current) return;
    setViewYear(rango.inicio.getFullYear());
    setViewMonth(rango.inicio.getMonth());
  }, [inicioKey, rango.inicio]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  const handleDayPress = (day: number) => {
    const tapped = new Date(viewYear, viewMonth, day);

    if (!rango.inicio || (rango.inicio && rango.fin)) {
      onRangoChange({ inicio: tapped, fin: null });
      selectingEnd.current = true;
      return;
    }

    if (tapped < rango.inicio) {
      onRangoChange({ inicio: tapped, fin: null });
      selectingEnd.current = true;
      return;
    }

    onRangoChange({ inicio: rango.inicio, fin: tapped });
    selectingEnd.current = false;
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

  const yearsList = getYearsAround(now.getFullYear());
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const daysList = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (calendarView === "years") {
    return (
      <View className="rounded-2xl bg-surface-hover p-3">
        <Pressable
          onPress={() => setCalendarView("days")}
          className="mb-3 items-center"
          accessibilityRole="button"
          accessibilityLabel="Volver al calendario de días"
        >
          <Text className="text-base font-bold text-accent">Seleccionar Año</Text>
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
                className={`rounded-xl px-3 py-2 ${active ? "bg-accent" : "bg-surface-elevated"}`}
                accessibilityRole="button"
                accessibilityLabel={`Año ${y}`}
                accessibilityState={{ selected: active }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    active ? "text-white" : "text-content-secondary"
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
      <View className="rounded-2xl bg-surface-hover p-3">
        <Pressable
          onPress={() => setCalendarView("years")}
          className="mb-3 items-center"
          accessibilityRole="button"
          accessibilityLabel="Seleccionar año"
        >
          <Text className="text-base font-bold text-accent">{viewYear}</Text>
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
                  active ? "bg-accent" : "bg-surface-elevated"
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Mes ${MONTH_FULL[idx]} de ${viewYear}`}
                accessibilityState={{ selected: active }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    active ? "text-white" : "text-content-secondary"
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
    <View className="rounded-2xl bg-surface-hover p-3">
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          onPress={() => navigateMonth(-1)}
          className="h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated"
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
        >
          <Text className="text-lg font-bold text-content-secondary">‹</Text>
        </Pressable>
        <Pressable
          onPress={() => setCalendarView("months")}
          accessibilityRole="button"
          accessibilityLabel="Cambiar mes"
          accessibilityHint="Abre la selección de mes"
        >
          <Text className="text-[15px] font-bold text-content-primary">
            {MONTH_FULL[viewMonth]} {viewYear}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => navigateMonth(1)}
          className="h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated"
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
        >
          <Text className="text-lg font-bold text-content-secondary">›</Text>
        </Pressable>
      </View>

      <View className="mb-1 flex-row">
        {DAY_HEADERS.map((d) => (
          <View key={d} style={{ width: "14.28%" }} className="items-center py-1">
            <Text className="text-[11px] font-semibold text-content-muted">{d}</Text>
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

          const rangeBg = inRange && !isEndpoint ? "bg-accent-soft" : "";

          const startEdge = isStart && rango.fin ? "rounded-l-full bg-accent-soft" : "";
          const endEdge = isEnd && rango.inicio ? "rounded-r-full bg-accent-soft" : "";
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
                  isEndpoint ? "bg-accent" : isToday ? "border border-accent" : ""
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
                        ? "font-bold text-accent"
                        : inRange
                          ? "font-medium text-accent"
                          : "font-medium text-content-secondary"
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
