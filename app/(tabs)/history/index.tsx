import PeriodFilter from "@/components/search/PeriodFilter";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Product, Venta, VentaDetalle } from "@/interface";
import { auth } from "@/lib/firebase";
import { getNegocioIdByUsuario } from "@/lib/services/usuarios-negocios";
import { getVentasByNegocio } from "@/lib/services/ventas";
import { getDetallesByVenta } from "@/lib/services/ventas-detalle";
import { useFiltrosStore } from "@/store/filtros-store";
import { useProductosStore } from "@/store/productos-store";
import { onAuthStateChanged } from "firebase/auth";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as Haptics from "expo-haptics";
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
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

function formatearMoneda(valor: number): string {
  return `$${valor.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateMockData(): {
  ventas: Venta[];
  detalles: VentaDetalle[];
  productos: Product[];
} {
  const ahora = new Date();
  const ventas: Venta[] = [];
  const detalles: VentaDetalle[] = [];
  const productos: Product[] = [
    {
      id: "1",
      negocio_id: "negocio-1",
      nombre: "Borrador Blanco",
      categoria_id: "cat-1",
      precio_venta: 0.4,
      precio_mayoreo: 0.3,
      costo_promedio: 0.2,
      cantidad: 100,
      activo: true,
    },
    {
      id: "2",
      negocio_id: "negocio-1",
      nombre: "Sobre Manila",
      categoria_id: "cat-2",
      precio_venta: 0.3,
      precio_mayoreo: 0.2,
      costo_promedio: 0.15,
      cantidad: 80,
      activo: true,
    },
    {
      id: "3",
      negocio_id: "negocio-1",
      nombre: "Folder Tamaño Carta",
      categoria_id: "cat-3",
      precio_venta: 0.8,
      precio_mayoreo: 0.6,
      costo_promedio: 0.4,
      cantidad: 60,
      activo: true,
    },
    {
      id: "4",
      negocio_id: "negocio-1",
      nombre: "Cuaderno Universitario",
      categoria_id: "cat-1",
      precio_venta: 6,
      precio_mayoreo: 5,
      costo_promedio: 3,
      cantidad: 50,
      activo: true,
    },
    {
      id: "5",
      negocio_id: "negocio-1",
      nombre: "Cinta Adhesiva",
      categoria_id: "cat-4",
      precio_venta: 1.2,
      precio_mayoreo: 1,
      costo_promedio: 0.6,
      cantidad: 40,
      activo: true,
    },
    {
      id: "6",
      negocio_id: "negocio-1",
      nombre: "Papel Construcción x10",
      categoria_id: "cat-2",
      precio_venta: 2.5,
      precio_mayoreo: 2,
      costo_promedio: 1.2,
      cantidad: 30,
      activo: true,
    },
    {
      id: "7",
      negocio_id: "negocio-1",
      nombre: "Carpeta 3 Anillos",
      categoria_id: "cat-3",
      precio_venta: 4.5,
      precio_mayoreo: 3.5,
      costo_promedio: 2.5,
      cantidad: 25,
      activo: true,
    },
  ];

  const combos = [
    [1, 2, 3, 4],
    [3, 2, 5],
    [1, 6, 7, 6],
  ];
  const totales = [16.5, 4.2, 17.8];

  for (let i = 0; i < 15; i++) {
    const ventaId = `sample-${i + 1}`;
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() - Math.floor(i / 3));
    fecha.setHours(13, 32, 0, 0);

    const combo = combos[i % combos.length];
    const total = totales[i % totales.length];
    const detalleList: VentaDetalle[] = [];
    let subtotalCalc = 0;

    combo.forEach((idx, j) => {
      const prod = productos[idx - 1];
      const cant =
        j === 0 ? 3 : j === 1 ? 2 : Math.floor(Math.random() * 3) + 1;
      const totalLinea = cant * prod.precio_venta;
      subtotalCalc += totalLinea;
      detalleList.push({
        id: `d-${i}-${j}`,
        venta_id: ventaId,
        producto_id: prod.id,
        cantidad: cant,
        precio_unitario: prod.precio_venta,
        total_linea: totalLinea,
      });
    });

    ventas.push({
      id: ventaId,
      negocio_id: "negocio-1",
      sucursal_id: "suc-1",
      usuario_id: "user-1",
      fecha,
      subtotal: subtotalCalc,
      descuento: 0,
      total,
      estado: i % 10 === 9 ? "REEMBOLSO" : "PAGADA",
      tipo_venta: "CONTADO",
    });
    detalles.push(...detalleList.map((d) => ({ ...d, venta_id: ventaId })));
  }

  return { ventas, detalles, productos };
}

function VentaCard({
  venta,
  detalles,
  fecha,
  isReembolso,
  productNames,
  products,
  onVerRecibo,
  onReembolso,
}: {
  venta: Venta;
  detalles: VentaDetalle[];
  fecha: Date;
  isReembolso: boolean;
  productNames: Record<string, string>;
  products: Product[];
  onVerRecibo: (v: Venta) => void;
  onReembolso: (v: Venta) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withTiming(expandido ? 400 : 0, {
      duration: 280,
    });
  }, [expandido, height]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    maxHeight: height.value,
    overflow: "hidden" as const,
  }));

  const toggleExpand = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandido((p) => !p);
  };

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
        onPress={toggleExpand}
        className="flex-row items-center justify-between px-4 py-3.5"
        activeOpacity={0.7}
      >
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {formatearFecha(fecha)}
            </Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {formatearHora(fecha)}
            </Text>
          </View>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" numberOfLines={1}>
            ID: {venta.id}
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
        <View
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-700 items-center justify-center"
        >
          <IconSymbol
            name={expandido ? "chevron.up" : "chevron.down"}
            size={14}
            color="#78716c"
          />
        </View>
      </TouchableOpacity>

      <Animated.View style={animatedContentStyle}>
        <View
          className="border-t border-gray-100 dark:border-neutral-700 px-4 pt-3 pb-4"
          pointerEvents={expandido ? "auto" : "none"}
        >
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Productos ({detalles.length})
          </Text>
          <View className="gap-2 mb-4">
            {detalles.map((d) => {
              const nombre =
                productNames[d.producto_id] ??
                products.find((p) => p.id === d.producto_id)?.nombre ??
                "Producto";
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
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onVerRecibo(venta);
              }}
              className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-orange-600"
              activeOpacity={0.85}
            >
              <IconSymbol name="eye.fill" size={18} color="white" />
              <Text className="text-white font-semibold text-[15px]">Ver Recibo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    </View>
  );
}

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detallesMap, setDetallesMap] = useState<
    Record<string, VentaDetalle[]>
  >({});
  const [loading, setLoading] = useState(true);
  const {
    periodo,
    rangoPersonalizado,
    setPeriodo,
    setRangoPersonalizado,
  } = useFiltrosStore();

  const loadData = useCallback(async (uid: string, email: string) => {
    try {
      setLoading(true);
      const negocioId = await getNegocioIdByUsuario(uid, email);

      if (negocioId) {
        const ventasFromDb = await getVentasByNegocio(negocioId);
        if (ventasFromDb.length > 0) {
          const map: Record<string, VentaDetalle[]> = {};
          for (const v of ventasFromDb) {
            const dets = await getDetallesByVenta(v.id);
            map[v.id] = dets;
          }
          setVentas(ventasFromDb);
          setDetallesMap(map);
          return;
        }
      }

      const {
        ventas: mockVentas,
        detalles: mockDetalles,
        productos: mockProds,
      } = generateMockData();

      const map: Record<string, VentaDetalle[]> = {};
      mockDetalles.forEach((d) => {
        const vid = d.venta_id;
        if (!map[vid]) map[vid] = [];
        map[vid].push(d);
      });

      setVentas(mockVentas);
      setDetallesMap(map);

      const currentProducts = useProductosStore.getState().products;
      if (currentProducts.length === 0) {
        useProductosStore.setState({ products: mockProds });
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
      const {
        ventas: mockVentas,
        detalles: mockDetalles,
        productos: mockProds,
      } = generateMockData();
      const map: Record<string, VentaDetalle[]> = {};
      mockDetalles.forEach((d) => {
        const vid = d.venta_id;
        if (!map[vid]) map[vid] = [];
        map[vid].push(d);
      });
      setVentas(mockVentas);
      setDetallesMap(map);
      const currentProducts = useProductosStore.getState().products;
      if (currentProducts.length === 0) {
        useProductosStore.setState({ products: mockProds });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) loadData(user.uid, user.email || "");
    });
    return () => unsub();
  }, [loadData]);

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

  const handleVerRecibo = (venta: Venta) => {
    // TODO: navegar a recibo o abrir modal
    console.log("Ver recibo", venta.id);
  };

  const handleReembolso = (venta: Venta) => {
    // TODO: flujo de reembolso
    console.log("Reembolso", venta.id);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      style={{ flex: 1 }}
    >
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
          <View className="mt-6 gap-4">
            {ventasFiltradas.map((venta) => {
              const detalles = detallesMap[venta.id] ?? [];
              const fecha =
                venta.fecha instanceof Date
                  ? venta.fecha
                  : new Date(venta.fecha);
              const isReembolso = venta.estado === "REEMBOLSO";

              return (
                <VentaCard
                  key={venta.id}
                  venta={venta}
                  detalles={detalles}
                  fecha={fecha}
                  isReembolso={isReembolso}
                  productNames={productNames}
                  products={products}
                  onVerRecibo={handleVerRecibo}
                  onReembolso={handleReembolso}
                />
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
    </Animated.View>
  );
}
