import type { RangoFechas } from "@/interface";
import { Pressable, Text, View } from "react-native";
import { RangeCalendar } from "./custom-range/RangeCalendar";
import { formatDateShort } from "./custom-range/calendar-utils";

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
