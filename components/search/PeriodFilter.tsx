import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * Tipo que define los períodos disponibles para filtrar
 */
export type Periodo = 'semana' | 'mes' | 'año' | 'personalizado';

/**
 * Interfaz que define el rango de fechas personalizado
 */
export interface RangoFechas {
  inicio: Date | null;
  fin: Date | null;
}

/**
 * Props del componente PeriodFilter
 */
export interface PeriodFilterProps {
  /** Período actualmente seleccionado */
  periodo: Periodo;
  /** Función que se ejecuta cuando se cambia el período */
  onPeriodoChange: (periodo: Periodo) => void;
  /** Rango de fechas personalizado (solo necesario si se usa 'personalizado') */
  rangoPersonalizado?: RangoFechas;
  /** Función que se ejecuta cuando se cambia el rango personalizado */
  onRangoPersonalizadoChange?: (rango: RangoFechas) => void;
  /** Función para formatear fechas (opcional, tiene un formato por defecto) */
  formatDate?: (date: Date | null) => string;
  /** Clase CSS adicional para el contenedor principal */
  containerClassName?: string;
  /** Clase CSS adicional para los botones */
  buttonClassName?: string;
  /** Clase CSS adicional para el texto de rango personalizado */
  rangeTextClassName?: string;
}

/**
 * Opciones de períodos disponibles
 */
const PERIODOS: Periodo[] = ['semana', 'mes', 'año', 'personalizado'];

/**
 * Formatea un período para mostrarlo en la UI
 */
const formatPeriodoLabel = (periodo: Periodo): string => {
  const labels: Record<Periodo, string> = {
    semana: 'Semana',
    mes: 'Mes',
    año: 'Año',
    personalizado: 'Personalizado',
  };
  return labels[periodo] || periodo.charAt(0).toUpperCase() + periodo.slice(1);
};

/**
 * Formatea una fecha a string (formato por defecto)
 */
const defaultFormatDate = (date: Date | null): string => {
  if (!date) return 'Seleccionar';
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Componente Selector de Fecha Optimizado - Tipo Wheel Picker
 */
function DatePicker({
  date,
  onDateChange,
  minDate,
}: {
  date: Date | null;
  onDateChange: (date: Date) => void;
  minDate?: Date | null;
}) {
  const ahora = new Date();
  const initialDate = date || ahora;
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const yearScrollRef = React.useRef<ScrollView>(null);
  const monthScrollRef = React.useRef<ScrollView>(null);
  const dayScrollRef = React.useRef<ScrollView>(null);

  const years = Array.from({ length: 20 }, (_, i) => ahora.getFullYear() - 10 + i);
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  // Ajustar día si es inválido para el mes seleccionado
  useEffect(() => {
    const maxDay = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  useEffect(() => {
    if (date) {
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
      setSelectedDay(date.getDate());
    }
  }, [date]);

  // Posicionar scrolls en los valores seleccionados cuando cambia la fecha inicial
  useEffect(() => {
    if (!date) return;
    
    const yearIndex = years.indexOf(selectedYear);
    const monthIndex = selectedMonth;
    const currentDays = Array.from(
      { length: getDaysInMonth(selectedYear, selectedMonth) },
      (_, i) => i + 1
    );
    const dayIndex = currentDays.indexOf(selectedDay);

    setTimeout(() => {
      if (yearIndex >= 0 && yearScrollRef.current) {
        yearScrollRef.current.scrollTo({ y: yearIndex * 40, animated: false });
      }
      if (monthIndex >= 0 && monthScrollRef.current) {
        monthScrollRef.current.scrollTo({ y: monthIndex * 40, animated: false });
      }
      if (dayIndex >= 0 && dayScrollRef.current) {
        dayScrollRef.current.scrollTo({ y: dayIndex * 40, animated: false });
      }
    }, 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    if (!minDate || newDate >= minDate) {
      onDateChange(newDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <View className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-gray-200 dark:border-neutral-700">
      <View className="flex-row gap-2">
        {/* Año */}
        <View className="flex-1">
          <View className="h-10 items-center justify-center mb-2">
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
              Año
            </Text>
          </View>
          <View className="relative h-40 bg-gray-50 dark:bg-neutral-900 rounded-xl overflow-hidden">
            {/* Indicador de selección */}
            <View className="absolute top-1/2 left-0 right-0 h-10 bg-orange-100 dark:bg-orange-900/40 rounded -translate-y-5 border border-orange-500/50" />
            
            <ScrollView
              ref={yearScrollRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={40}
              decelerationRate="fast"
              onScroll={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / 40);
                if (index >= 0 && index < years.length) {
                  setSelectedYear(years[index]);
                }
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingVertical: 80 }}
            >
              {years.map((year) => {
                const isSelected = selectedYear === year;
                return (
                  <View
                    key={year}
                    style={{ height: 40 }}
                    className="items-center justify-center"
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? 'text-orange-600 dark:text-orange-500 font-bold'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {year}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
          <View className="h-10 items-center justify-center mt-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Text className="text-base text-orange-600 dark:text-orange-500 font-bold">
              {selectedYear}
            </Text>
          </View>
        </View>

        {/* Mes */}
        <View className="flex-1">
          <View className="h-10 items-center justify-center mb-2">
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
              Mes
            </Text>
          </View>
          <View className="relative h-40 bg-gray-50 dark:bg-neutral-900 rounded-xl overflow-hidden">
            {/* Indicador de selección */}
            <View className="absolute top-1/2 left-0 right-0 h-10 bg-orange-100 dark:bg-orange-900/40 rounded -translate-y-5 border border-orange-500/50" />
            
            <ScrollView
              ref={monthScrollRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={40}
              decelerationRate="fast"
              onScroll={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / 40);
                if (index >= 0 && index < months.length) {
                  setSelectedMonth(index);
                }
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingVertical: 80 }}
            >
              {months.map((month, index) => {
                const isSelected = selectedMonth === index;
                return (
                  <View
                    key={index}
                    style={{ height: 40 }}
                    className="items-center justify-center"
                  >
                    <Text
                      className={`text-sm ${
                        isSelected
                          ? 'text-orange-600 dark:text-orange-500 font-bold'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {month}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
          <View className="h-10 items-center justify-center mt-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Text className="text-base text-orange-600 dark:text-orange-500 font-bold">
              {months[selectedMonth]}
            </Text>
          </View>
        </View>

        {/* Día */}
        <View className="flex-1">
          <View className="h-10 items-center justify-center mb-2">
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
              Día
            </Text>
          </View>
          <View className="relative h-40 bg-gray-50 dark:bg-neutral-900 rounded-xl overflow-hidden">
            {/* Indicador de selección */}
            <View className="absolute top-1/2 left-0 right-0 h-10 bg-orange-100 dark:bg-orange-900/40 rounded -translate-y-5 border border-orange-500/50" />
            
            <ScrollView
              ref={dayScrollRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={40}
              decelerationRate="fast"
              onScroll={(e) => {
                const offsetY = e.nativeEvent.contentOffset.y;
                const index = Math.round(offsetY / 40);
                if (index >= 0 && index < days.length) {
                  setSelectedDay(days[index]);
                }
              }}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingVertical: 80 }}
            >
              {days.map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <View
                    key={day}
                    style={{ height: 40 }}
                    className="items-center justify-center"
                  >
                    <Text
                      className={`text-base ${
                        isSelected
                          ? 'text-orange-600 dark:text-orange-500 font-bold'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
          <View className="h-10 items-center justify-center mt-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Text className="text-base text-orange-600 dark:text-orange-500 font-bold">
              {selectedDay}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/**
 * Componente reutilizable para filtrar por período de tiempo
 * 
 * @example
 * ```tsx
 * <PeriodFilter
 *   periodo={periodo}
 *   onPeriodoChange={handlePeriodoChange}
 *   rangoPersonalizado={rangoPersonalizado}
 *   onRangoPersonalizadoChange={setRangoPersonalizado}
 *   formatDate={formatDate}
 * />
 * ```
 */
export default function PeriodFilter({
  periodo,
  onPeriodoChange,
  rangoPersonalizado,
  onRangoPersonalizadoChange,
  formatDate = defaultFormatDate,
  containerClassName = '',
  buttonClassName = '',
  rangeTextClassName = '',
}: PeriodFilterProps) {
  const [showModalPersonalizado, setShowModalPersonalizado] = useState(false);
  const [rangoTemporal, setRangoTemporal] = useState<RangoFechas>({
    inicio: rangoPersonalizado?.inicio || null,
    fin: rangoPersonalizado?.fin || null,
  });
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sincronizar rangoTemporal con rangoPersonalizado cuando cambia externamente
  useEffect(() => {
    if (rangoPersonalizado) {
      setRangoTemporal(rangoPersonalizado);
    }
  }, [rangoPersonalizado]);

  const handlePeriodoPress = (p: Periodo) => {
    if (p === 'personalizado') {
      setShowModalPersonalizado(true);
      // Animar entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      onPeriodoChange(p);
      if (onRangoPersonalizadoChange) {
        onRangoPersonalizadoChange({ inicio: null, fin: null });
      }
    }
  };

  const handleCloseModal = () => {
    // Animar salida
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setShowModalPersonalizado(false);
    });
  };

  const handleConfirmarPersonalizado = () => {
    if (rangoTemporal.inicio && rangoTemporal.fin) {
      if (rangoTemporal.inicio <= rangoTemporal.fin) {
        if (onRangoPersonalizadoChange) {
          onRangoPersonalizadoChange(rangoTemporal);
        }
        onPeriodoChange('personalizado');
        handleCloseModal();
      }
    }
  };

  const hasCustomRange =
    periodo === 'personalizado' &&
    rangoPersonalizado?.inicio &&
    rangoPersonalizado?.fin;

  return (
    <>
      <View className={`mb-6 w-full ${containerClassName}`}>
        {/* Botones de período */}
        <View className="flex-row flex-wrap gap-2 w-full">
          {PERIODOS.map((p) => {
            const isSelected = periodo === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => handlePeriodoPress(p)}
                className={`flex-1 min-w-[80px] px-4 py-3 rounded-lg items-center justify-center ${
                  isSelected
                    ? 'bg-orange-600'
                    : 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700'
                } ${buttonClassName}`}
                accessibilityLabel={`Filtrar por ${formatPeriodoLabel(p)}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  className={`font-semibold text-sm ${
                    isSelected
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {formatPeriodoLabel(p)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Mostrar rango personalizado si está seleccionado */}
        {hasCustomRange && (
          <Text
            className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${rangeTextClassName}`}
            accessibilityLabel={`Rango seleccionado: ${formatDate(rangoPersonalizado.inicio)} hasta ${formatDate(rangoPersonalizado.fin)}`}
          >
            {formatDate(rangoPersonalizado.inicio)} - {formatDate(rangoPersonalizado.fin)}
          </Text>
        )}
      </View>

      {/* Modal para Período Personalizado - Bottom Sheet con Animaciones */}
      <Modal
        visible={showModalPersonalizado}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: fadeAnim,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleCloseModal}
            className="flex-1 justify-end"
          >
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-800 rounded-t-3xl p-6 max-h-[85%] w-full"
              >
                {/* Handle bar */}
                <View className="w-12 h-1 bg-gray-300 dark:bg-neutral-600 rounded-full self-center mb-6" />

                <Text className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">
                  Seleccionar Período Personalizado
                </Text>

                {/* Selector de Fecha Inicio */}
                <View className="mb-6">
                  <Text className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Fecha Inicio
                  </Text>
                  <DatePicker
                    date={rangoTemporal.inicio}
                    onDateChange={(date) =>
                      setRangoTemporal((prev) => ({ ...prev, inicio: date }))
                    }
                  />
                </View>

                {/* Selector de Fecha Fin */}
                <View className="mb-6">
                  <Text className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Fecha Fin
                  </Text>
                  <DatePicker
                    date={rangoTemporal.fin}
                    onDateChange={(date) =>
                      setRangoTemporal((prev) => ({ ...prev, fin: date }))
                    }
                    minDate={rangoTemporal.inicio}
                  />
                </View>

                {/* Botones */}
                <View className="gap-3 mt-2">
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    className="w-full bg-gray-100 dark:bg-neutral-700 rounded-xl py-4 items-center justify-center shadow-sm"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-800 dark:text-gray-200 font-semibold text-base">
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmarPersonalizado}
                    className="w-full bg-orange-600 rounded-xl py-4 items-center justify-center shadow-lg"
                    disabled={!rangoTemporal.inicio || !rangoTemporal.fin}
                    activeOpacity={0.8}
                    style={{
                      opacity: !rangoTemporal.inicio || !rangoTemporal.fin ? 0.5 : 1,
                    }}
                  >
                    <Text className="text-white font-semibold text-base">Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}
