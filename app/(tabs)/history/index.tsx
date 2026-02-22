import PeriodFilter from "@/components/search/PeriodFilter";
import AnimatedScreen from "@/components/ui/AnimatedScreen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Venta, VentaDetalle } from "@/interface";
import { generateAndShareRecibo } from "@/lib/pdf/generate-recibo";
import type { ReciboData } from "@/lib/pdf/recibo-template";
import { onVentasByNegocio } from "@/lib/services/ventas";
import { refundVentaFlow } from "@/lib/services/ventas/refund-venta";
import { getDetallesByVenta } from "@/lib/services/ventas-detalle";
import { notify } from "@/lib/notify";
import { useFiltrosStore } from "@/store/filtros-store";
import { useProductosStore } from "@/store/productos-store";
import { useSessionStore } from "@/store/session-store";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import ConfirmAlert from "@/components/ui/ConfirmAlert";

function formatearMoneda(valor: number): string {
  return `$${valor.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateKey(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
}

function formatDateHeader(fecha: Date): string {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  if (getDateKey(fecha) === getDateKey(hoy)) return "Hoy";
  if (getDateKey(fecha) === getDateKey(ayer)) return "Ayer";

  return fecha.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
  });
}

interface VentaGroup {
  key: string;
  label: string;
  ventas: { venta: Venta; detalles: VentaDetalle[]; fecha: Date }[];
  total: number;
}

function groupVentasByDate(
  ventas: Venta[],
  detallesMap: Record<string, VentaDetalle[]>,
): VentaGroup[] {
  const groups: Record<string, VentaGroup> = {};

  for (const venta of ventas) {
    const fecha =
      venta.fecha instanceof Date ? venta.fecha : new Date(venta.fecha);
    const key = getDateKey(fecha);

    if (!groups[key]) {
      groups[key] = {
        key,
        label: formatDateHeader(fecha),
        ventas: [],
        total: 0,
      };
    }

    groups[key].ventas.push({
      venta,
      detalles: detallesMap[venta.id] ?? [],
      fecha,
    });
    groups[key].total += venta.total;
  }

  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
}

function VentaCard({
  venta,
  detalles,
  fecha,
  isReembolso,
  expandido,
  productNames,
  onToggle,
  onVerRecibo,
  onReembolso,
}: {
  venta: Venta;
  detalles: VentaDetalle[];
  fecha: Date;
  isReembolso: boolean;
  expandido: boolean;
  productNames: Record<string, string>;
  onToggle: () => void;
  onVerRecibo: (v: Venta) => void;
  onReembolso: (v: Venta) => void;
}) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(expandido ? 1 : 0, { duration: 200 });
  }, [expandido, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-700"
      style={
        Platform.OS === "web"
          ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }
          : { elevation: 2 }
      }
    >
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS !== "web")
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
        className="flex-row items-center justify-between px-4 py-3.5"
        activeOpacity={0.7}
      >
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {formatearHora(fecha)}
          </Text>
          <Text
            className="text-xs text-gray-400 dark:text-gray-500 mt-0.5"
            numberOfLines={1}
          >
            {detalles.length} producto{detalles.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <Text
          className={`text-lg font-bold mr-2 ${
            isReembolso
              ? "text-red-600 dark:text-red-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {formatearMoneda(venta.total)}
        </Text>
        <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-700 items-center justify-center">
          <IconSymbol
            name={expandido ? "chevron.up" : "chevron.down"}
            size={14}
            color="#78716c"
          />
        </View>
      </TouchableOpacity>

      {expandido && (
        <Animated.View style={animatedStyle}>
          <View className="border-t border-gray-100 dark:border-neutral-700 px-4 pt-3 pb-4">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Productos ({detalles.length})
            </Text>
            <View className="gap-2 mb-4">
              {detalles.map((d) => {
                const nombre = productNames[d.producto_id] ?? "Producto";
                return (
                  <View
                    key={d.id}
                    className="flex-row justify-between items-center py-1.5"
                  >
                    <Text
                      className="text-gray-700 dark:text-gray-300 flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {d.cantidad}× {nombre}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm tabular-nums">
                      {formatearMoneda(d.total_linea)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web")
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onVerRecibo(venta);
                }}
                className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-orange-600"
                activeOpacity={0.85}
              >
                <IconSymbol name="eye.fill" size={18} color="white" />
                <Text className="text-white font-semibold text-[15px]">
                  Ver Recibo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web")
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onReembolso(venta);
                }}
                disabled={isReembolso}
                style={isReembolso ? { opacity: 0.6 } : undefined}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${
                  isReembolso
                    ? "bg-gray-100 dark:bg-neutral-700"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
                activeOpacity={0.85}
              >
                <IconSymbol
                  name="arrow.uturn.backward"
                  size={18}
                  color={isReembolso ? "#9ca3af" : "#dc2626"}
                />
                <Text
                  className={`font-semibold text-[15px] ${
                    isReembolso
                      ? "text-gray-500 dark:text-gray-500"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  Reembolso
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const negocioId = useSessionStore((s) => s.negocioId);
  const sessionReady = useSessionStore((s) => s.ready);

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detallesMap, setDetallesMap] = useState<
    Record<string, VentaDetalle[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundTarget, setRefundTarget] = useState<Venta | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const { sucursalId, userId } = useSessionStore();
  const { periodo, rangoPersonalizado, setPeriodo, setRangoPersonalizado } =
    useFiltrosStore();

  const detallesCacheRef = useRef<Record<string, VentaDetalle[]>>({});

  useEffect(() => {
    if (!sessionReady) return;

    if (!negocioId) {
      setLoading(false);
      setError("No tienes un negocio asignado");
      return;
    }

    setLoading(true);
    setError(null);

    const retryTimerRef = { current: null as ReturnType<typeof setTimeout> | null };

    const fetchDetalles = async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(async (id) => ({
          id,
          dets: await getDetallesByVenta(id),
        })),
      );
      const updated = { ...detallesCacheRef.current };
      const stillEmpty: string[] = [];

      for (const { id, dets } of results) {
        if (dets.length > 0) {
          updated[id] = dets;
        } else {
          stillEmpty.push(id);
        }
      }

      detallesCacheRef.current = updated;
      setDetallesMap(updated);
      return stillEmpty;
    };

    const unsub = onVentasByNegocio(
      negocioId,
      async (ventasFromDb) => {
        setVentas(ventasFromDb);

        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }

        const idsToFetch = ventasFromDb
          .map((v) => v.id)
          .filter((id) => !detallesCacheRef.current[id]?.length);

        if (idsToFetch.length > 0) {
          const stillEmpty = await fetchDetalles(idsToFetch);

          if (stillEmpty.length > 0) {
            retryTimerRef.current = setTimeout(async () => {
              await fetchDetalles(stillEmpty);
            }, 2000);
          }
        } else {
          setDetallesMap(detallesCacheRef.current);
        }

        setLoading(false);
      },
      (err) => {
        console.error("Error en listener de historial:", err);
        setError("No se pudo cargar el historial de ventas");
        setLoading(false);
      },
    );

    return () => {
      unsub();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [sessionReady, negocioId]);

  const ventasFiltradas = useMemo(() => {
    const ahora = new Date();
    ahora.setHours(23, 59, 59, 999);
    let inicio: Date;
    let fin: Date = ahora;

    switch (periodo) {
      case "semana":
        inicio = new Date(ahora);
        inicio.setDate(inicio.getDate() - 6);
        inicio.setHours(0, 0, 0, 0);
        break;
      case "mes":
        inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        inicio.setHours(0, 0, 0, 0);
        break;
      case "año":
        inicio = new Date(ahora.getFullYear(), 0, 1);
        inicio.setHours(0, 0, 0, 0);
        break;
      case "personalizado":
        if (rangoPersonalizado.inicio && rangoPersonalizado.fin) {
          inicio = new Date(rangoPersonalizado.inicio);
          inicio.setHours(0, 0, 0, 0);
          fin = new Date(rangoPersonalizado.fin);
          fin.setHours(23, 59, 59, 999);
        } else {
          return [];
        }
        break;
      default:
        inicio = new Date(0);
    }

    return ventas.filter((v) => {
      const f = v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
      return f >= inicio && f <= fin;
    });
  }, [ventas, periodo, rangoPersonalizado]);

  const ventasAgrupadas = useMemo(
    () => groupVentasByDate(ventasFiltradas, detallesMap),
    [ventasFiltradas, detallesMap],
  );

  const formatDate = (date: Date | null) => {
    if (!date) return "Seleccionar";
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const products = useProductosStore((s) => s.products);
  const productNames = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.nombre])),
    [products],
  );

  const handleVerRecibo = async (venta: Venta) => {
    const detalles = detallesMap[venta.id] ?? [];
    if (detalles.length === 0) {
      notify.warning({ title: "Sin detalles para esta venta" });
      return;
    }

    const fecha =
      venta.fecha instanceof Date ? venta.fecha : new Date(venta.fecha);

    const reciboData: ReciboData = {
      ventaId: venta.id,
      fecha,
      items: detalles.map((d) => ({
        nombre: productNames[d.producto_id] ?? "Producto",
        cantidad: d.cantidad,
        precioUnitario: d.precio_unitario,
        totalLinea: d.total_linea,
      })),
      subtotal: venta.subtotal,
      descuento: venta.descuento,
      total: venta.total,
      metodoPago: "Efectivo",
    };

    try {
      await generateAndShareRecibo(reciboData);
    } catch (err) {
      console.error("Error generando recibo:", err);
      notify.error({ title: "No se pudo generar el recibo" });
    }
  };

  const toggleCard = useCallback((ventaId: string) => {
    setExpandedIds((prev) =>
      prev.includes(ventaId) ? [] : [ventaId],
    );
  }, []);

  const handleReembolso = useCallback((venta: Venta) => {
    if (venta.estado === "REEMBOLSO") return;
    setRefundTarget(venta);
  }, []);

  const handleConfirmRefund = useCallback(async () => {
    if (!refundTarget || refunding) return;
    setRefunding(true);
    try {
      await refundVentaFlow({
        ventaId: refundTarget.id,
        sucursalId: sucursalId ?? "",
        userId: userId ?? "",
      });

      const detalles = detallesMap[refundTarget.id] ?? [];
      const currentProducts = useProductosStore.getState().products;
      const updated = currentProducts.map((p) => {
        const det = detalles.find((d) => d.producto_id === p.id);
        return det ? { ...p, cantidad: p.cantidad + det.cantidad } : p;
      });
      useProductosStore.getState().setProducts(updated);

      notify.success({ title: "Reembolso procesado correctamente" });
    } catch (err) {
      console.error("Error al procesar reembolso:", err);
      notify.error({ title: "No se pudo procesar el reembolso" });
    } finally {
      setRefunding(false);
      setRefundTarget(null);
    }
  }, [refundTarget, refunding, sucursalId, userId, detallesMap]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  if (error) {
    return (
      <AnimatedScreen>
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900 px-6">
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={48}
            color="#ef4444"
            style={{ marginBottom: 12 }}
          />
          <Text className="text-base font-medium text-gray-700 dark:text-gray-300 text-center">
            {error}
          </Text>
        </View>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen>
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-neutral-900"
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 32 : 16,
          paddingVertical: 20,
          paddingBottom: 120,
        }}
      >
        <View className={isTablet ? "max-w-5xl mx-auto w-full" : ""}>
          <PeriodFilter
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            rangoPersonalizado={rangoPersonalizado}
            onRangoPersonalizadoChange={setRangoPersonalizado}
            formatDate={formatDate}
          />

          {ventasFiltradas.length === 0 ? (
            <View className="mt-12 items-center justify-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700">
              <IconSymbol
                name="clock.fill"
                size={64}
                color="#9ca3af"
                style={{ marginBottom: 16 }}
              />
              <Text className="text-lg font-medium text-gray-600 dark:text-gray-400 text-center px-4">
                No hay ventas en este período
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-center px-4 mt-2">
                Cambia el filtro o registra nuevas ventas
              </Text>
            </View>
          ) : (
            <View className="mt-4 gap-6">
              {ventasAgrupadas.map((group) => (
                <View key={group.key}>
                  <View className="flex-row items-center justify-between mb-3 px-1">
                    <Text className="text-base font-bold text-gray-800 dark:text-gray-100 capitalize">
                      {group.label}
                    </Text>
                    <Text className="text-xl font-semibold text-gray-500 dark:text-gray-400 tabular-nums">
                      Total: {formatearMoneda(group.total)}
                    </Text>
                  </View>
                  <View className="gap-3">
                    {group.ventas.map(({ venta, detalles, fecha }) => (
                      <VentaCard
                        key={venta.id}
                        venta={venta}
                        detalles={detalles}
                        fecha={fecha}
                        isReembolso={venta.estado === "REEMBOLSO"}
                        expandido={expandedIds.includes(venta.id)}
                        productNames={productNames}
                        onToggle={() => toggleCard(venta.id)}
                        onVerRecibo={handleVerRecibo}
                        onReembolso={handleReembolso}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmAlert
        visible={!!refundTarget}
        title="Confirmar reembolso"
        message={
          refundTarget
            ? `¿Reembolsar la venta por ${formatearMoneda(refundTarget.total)}? Se devolverá el stock de los productos.`
            : ""
        }
        confirmText={refunding ? "Procesando..." : "Reembolsar"}
        cancelText="Cancelar"
        onConfirm={handleConfirmRefund}
        onCancel={() => setRefundTarget(null)}
        danger
      />
    </AnimatedScreen>
  );
}
