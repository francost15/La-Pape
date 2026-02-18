import KpisCard from "@/components/resumen/kpisCard";
import PeriodFilter from "@/components/search/PeriodFilter";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Product, Venta, VentaDetalle } from "@/interface";
import { auth } from "@/lib/firebase";
import { useFiltrosStore, type Periodo } from "@/store/filtros-store";
import { useProductosStore } from "@/store/productos-store";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import Svg, { Circle, G, Path, Text as SvgText } from "react-native-svg";

interface ProductoVenta {
  producto: Product;
  cantidad: number;
  total: number;
}

export default function ResumenScreen() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [detalles, setDetalles] = useState<VentaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    periodo,
    rangoPersonalizado,
    setPeriodo,
    setRangoPersonalizado,
  } = useFiltrosStore();
  const { products, categories } = useProductosStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadData(user.uid, user.email || "");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para generar datos falsos
  const generateMockData = () => {
    const ahora = new Date();
    const mockVentas: Venta[] = [];
    const mockDetalles: VentaDetalle[] = [];
    const mockProductos: Product[] = [
      {
        id: "1",
        negocio_id: "negocio-1",
        nombre: "Cuaderno Espiral",
        categoria_id: "cat-1",
        precio_venta: 15.5,
        precio_mayoreo: 12.0,
        costo_promedio: 8.0,
        cantidad: 50,
        activo: true,
      },
      {
        id: "2",
        negocio_id: "negocio-1",
        nombre: "Papel A4",
        categoria_id: "cat-2",
        precio_venta: 12.0,
        precio_mayoreo: 10.0,
        costo_promedio: 6.5,
        cantidad: 100,
        activo: true,
      },
      {
        id: "3",
        negocio_id: "negocio-1",
        nombre: "Lápiz HB",
        categoria_id: "cat-3",
        precio_venta: 2.5,
        precio_mayoreo: 2.0,
        costo_promedio: 1.2,
        cantidad: 200,
        activo: true,
      },
      {
        id: "4",
        negocio_id: "negocio-1",
        nombre: "Bolígrafo Azul",
        categoria_id: "cat-3",
        precio_venta: 3.0,
        precio_mayoreo: 2.5,
        costo_promedio: 1.5,
        cantidad: 150,
        activo: true,
      },
      {
        id: "5",
        negocio_id: "negocio-1",
        nombre: "Carpeta Archivador",
        categoria_id: "cat-4",
        precio_venta: 25.0,
        precio_mayoreo: 20.0,
        costo_promedio: 12.0,
        cantidad: 30,
        activo: true,
      },
      {
        id: "6",
        negocio_id: "negocio-1",
        nombre: "Resaltador Amarillo",
        categoria_id: "cat-5",
        precio_venta: 4.5,
        precio_mayoreo: 3.5,
        costo_promedio: 2.0,
        cantidad: 80,
        activo: true,
      },
    ];

    // Generar ventas de los últimos 90 días para tener más datos
    for (let i = 0; i < 90; i++) {
      const fecha = new Date(ahora);
      fecha.setDate(fecha.getDate() - i);
      fecha.setHours(
        Math.floor(Math.random() * 12) + 8,
        Math.floor(Math.random() * 60),
        0,
        0,
      );

      const numProductos = Math.floor(Math.random() * 3) + 1;
      const productosVenta = mockProductos
        .sort(() => Math.random() - 0.5)
        .slice(0, numProductos);

      let subtotal = 0;
      const detallesVenta: VentaDetalle[] = [];

      productosVenta.forEach((producto) => {
        const cantidad = Math.floor(Math.random() * 5) + 1;
        const precioUnitario = producto.precio_venta;
        const totalLinea = cantidad * precioUnitario;
        subtotal += totalLinea;

        detallesVenta.push({
          id: `detalle-${i}-${producto.id}`,
          venta_id: `venta-${i}`,
          producto_id: producto.id,
          cantidad,
          precio_unitario: precioUnitario,
          total_linea: totalLinea,
        });
      });

      const descuento = Math.random() > 0.7 ? subtotal * 0.1 : 0;
      const total = subtotal - descuento;

      const estados: ("PAGADA" | "PENDIENTE" | "REEMBOLSO")[] = [
        "PAGADA",
        "PAGADA",
        "PAGADA",
        "PENDIENTE",
        "REEMBOLSO",
      ];
      const estado = estados[Math.floor(Math.random() * estados.length)];

      mockVentas.push({
        id: `venta-${i}`,
        negocio_id: "negocio-1",
        sucursal_id: "sucursal-1",
        usuario_id: "usuario-1",
        fecha,
        subtotal,
        descuento,
        total,
        estado,
        tipo_venta: "CONTADO",
      });

      mockDetalles.push(...detallesVenta);
    }

    return { mockVentas, mockDetalles, mockProductos };
  };

  const loadData = async (uid: string, email: string) => {
    try {
      setLoading(true);

      const { mockVentas, mockDetalles, mockProductos } = generateMockData();
      setVentas(mockVentas);
      setDetalles(mockDetalles);

      if (products.length === 0) {
        useProductosStore.setState({ products: mockProductos });
      }

      if (useProductosStore.getState().categories.length === 0) {
        useProductosStore.setState({
          categories: [
            {
              id: "cat-1",
              nombre: "Cuadernos",
              negocio_id: "negocio-1",
              activo: true,
            },
            {
              id: "cat-2",
              nombre: "Papel",
              negocio_id: "negocio-1",
              activo: true,
            },
            {
              id: "cat-3",
              nombre: "Escritura",
              negocio_id: "negocio-1",
              activo: true,
            },
            {
              id: "cat-4",
              nombre: "Archivadores",
              negocio_id: "negocio-1",
              activo: true,
            },
            {
              id: "cat-5",
              nombre: "Accesorios",
              negocio_id: "negocio-1",
              activo: true,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ventas por período - CORREGIDO
  const ventasFiltradas = useMemo(() => {
    const ahora = new Date();
    ahora.setHours(23, 59, 59, 999); // Fin del día actual

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
      const fechaVenta = v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
      return fechaVenta >= inicio && fechaVenta <= fin;
    });
  }, [ventas, periodo, rangoPersonalizado]);

  // Calcular métricas
  const metricas = useMemo(() => {
    const ventasPagadas = ventasFiltradas.filter((v) => v.estado === "PAGADA");
    const ventasTotales = ventasPagadas.reduce((sum, v) => sum + v.total, 0);
    const transacciones = ventasPagadas.length;
    const devoluciones = ventasFiltradas.filter(
      (v) => v.estado === "REEMBOLSO",
    ).length;
    const totalDevoluciones = ventasFiltradas
      .filter((v) => v.estado === "REEMBOLSO")
      .reduce((sum, v) => sum + v.total, 0);

    const detallesFiltrados = detalles.filter((d) =>
      ventasPagadas.some((v) => v.id === d.venta_id),
    );

    let costoTotal = 0;
    detallesFiltrados.forEach((detalle) => {
      const producto = products.find((p) => p.id === detalle.producto_id);
      if (producto && producto.costo_promedio) {
        costoTotal += detalle.cantidad * producto.costo_promedio;
      }
    });

    const gananciaNeta = ventasTotales - costoTotal;
    const porcentajeGanancia =
      ventasTotales > 0 ? (gananciaNeta / ventasTotales) * 100 : 0;
    const porcentajeDevoluciones =
      transacciones > 0 ? (devoluciones / transacciones) * 100 : 0;

    return {
      ventasTotales,
      gananciaNeta,
      costoTotal,
      porcentajeGanancia,
      transacciones,
      promedioTransaccion:
        transacciones > 0 ? ventasTotales / transacciones : 0,
      devoluciones,
      totalDevoluciones,
      porcentajeDevoluciones,
    };
  }, [ventasFiltradas, detalles, products]);

  // Productos más y menos vendidos
  const productosVentas = useMemo(() => {
    const detallesFiltrados = detalles.filter((d) =>
      ventasFiltradas.some((v) => v.id === d.venta_id && v.estado === "PAGADA"),
    );

    const productosMap = new Map<string, ProductoVenta>();

    detallesFiltrados.forEach((detalle) => {
      const producto = products.find((p) => p.id === detalle.producto_id);
      if (producto) {
        const existente = productosMap.get(producto.id);
        if (existente) {
          existente.cantidad += detalle.cantidad;
          existente.total += detalle.total_linea;
        } else {
          productosMap.set(producto.id, {
            producto,
            cantidad: detalle.cantidad,
            total: detalle.total_linea,
          });
        }
      }
    });

    const productosArray = Array.from(productosMap.values());
    productosArray.sort((a, b) => b.cantidad - a.cantidad);

    return {
      masVendidos: productosArray.slice(0, 5),
      menosVendidos: productosArray.slice(-5).reverse(),
    };
  }, [detalles, ventasFiltradas, products]);

  // Datos para gráfico de evolución - MEJORADO
  const datosEvolucion = useMemo(() => {
    if (ventasFiltradas.length === 0) {
      return [];
    }

    const ahora = new Date();
    let inicio: Date;
    let fin: Date = ahora;
    let dias: number;

    switch (periodo) {
      case "semana":
        inicio = new Date(ahora);
        inicio.setDate(inicio.getDate() - 6);
        dias = 7;
        break;
      case "mes":
        inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        dias = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
        break;
      case "año":
        inicio = new Date(ahora.getFullYear(), 0, 1);
        dias = periodo === "año" ? 12 : 30; // 12 meses para año
        break;
      case "personalizado":
        if (rangoPersonalizado.inicio && rangoPersonalizado.fin) {
          inicio = new Date(rangoPersonalizado.inicio);
          fin = new Date(rangoPersonalizado.fin);
          const diffTime = Math.abs(fin.getTime() - inicio.getTime());
          dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          if (dias > 365) {
            // Si es más de un año, agrupar por meses
            dias = 12;
          }
        } else {
          return [];
        }
        break;
      default:
        dias = 7;
        inicio = new Date(ahora);
        inicio.setDate(inicio.getDate() - 6);
    }

    const datos: { fecha: Date; total: number }[] = [];
    const ventasPagadas = ventasFiltradas.filter((v) => v.estado === "PAGADA");

    if (periodo === "año" || (periodo === "personalizado" && dias > 365)) {
      // Agrupar por meses
      for (let i = 0; i < 12; i++) {
        const fecha = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1);
        const mesSiguiente = new Date(
          fecha.getFullYear(),
          fecha.getMonth() + 1,
          0,
        );

        const total = ventasPagadas
          .filter((v) => {
            const fechaVenta =
              v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
            return fechaVenta >= fecha && fechaVenta <= mesSiguiente;
          })
          .reduce((sum, v) => sum + v.total, 0);

        datos.push({ fecha, total });
      }
    } else {
      // Agrupar por días
      for (let i = 0; i < dias; i++) {
        const fecha = new Date(inicio);
        fecha.setDate(fecha.getDate() + i);
        fecha.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);

        const total = ventasPagadas
          .filter((v) => {
            const fechaVenta =
              v.fecha instanceof Date ? v.fecha : new Date(v.fecha);
            return fechaVenta >= fecha && fechaVenta <= fechaFin;
          })
          .reduce((sum, v) => sum + v.total, 0);

        datos.push({ fecha, total });
      }
    }

    return datos;
  }, [ventasFiltradas, periodo, rangoPersonalizado]);

  // Datos para gráfico de categorías
  const datosCategorias = useMemo(() => {
    const detallesFiltrados = detalles.filter((d) =>
      ventasFiltradas.some((v) => v.id === d.venta_id && v.estado === "PAGADA"),
    );

    const categoriasMap = new Map<string, number>();

    detallesFiltrados.forEach((detalle) => {
      const producto = products.find((p) => p.id === detalle.producto_id);
      if (producto && producto.categoria_id) {
        const categoria = categories.find(
          (c) => c.id === producto.categoria_id,
        );
        if (categoria) {
          const total = categoriasMap.get(categoria.nombre) || 0;
          categoriasMap.set(categoria.nombre, total + detalle.total_linea);
        }
      }
    });

    return Array.from(categoriasMap.entries())
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);
  }, [detalles, ventasFiltradas, products, categories]);


  const formatDate = (date: Date | null): string => {
    if (!date) return "Seleccionar";
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-neutral-900">
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width;
  const isTablet = screenWidth >= 768;

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-neutral-900 p-4 lg:p-8"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-4 py-6">
          <PeriodFilter
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            rangoPersonalizado={rangoPersonalizado}
            onRangoPersonalizadoChange={setRangoPersonalizado}
            formatDate={formatDate}
          />
          {/* KPIs */}
          <View
            className={`mb-6 gap-4 ${
              isTablet ? "flex-row flex-wrap" : "flex-col"
            }`}
          >
            <KpisCard
              title="Ventas Totales"
              value={metricas.ventasTotales}
              transactions={metricas.transacciones}
              icon={
                <IconSymbol
                  name="dollarsign.circle.fill"
                  size={24}
                  color="white"
                />
              }
              className="bg-orange-500"
            />
            <KpisCard
              title="Ganancia Neta"
              value={metricas.gananciaNeta}
              transactions={metricas.transacciones}
              icon={
                <IconSymbol
                  name="dollarsign.circle.fill"
                  size={24}
                  color="white"
                />
              }
              className="bg-green-500"
            />
            <KpisCard
              title="Transacciones"
              value={metricas.transacciones}
              transactions={metricas.transacciones}
              icon={<IconSymbol name="cart.fill" size={24} color="white" />}
              className="bg-purple-500"
            />
            <KpisCard
              title="Devoluciones"
              value={metricas.devoluciones}
              transactions={metricas.transacciones}
              icon={<IconSymbol name="cart.fill" size={24} color="white" />}
              className="bg-red-500"
            />
          </View>

          {/* Gráficos */}
          <View className={`mb-6 gap-4 ${isTablet ? "flex-row" : "flex-col"}`}>
            <View className="flex-1 bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-neutral-700">
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Evolución de Ventas
              </Text>
              {datosEvolucion.length > 0 &&
              datosEvolucion.some((d) => d.total > 0) ? (
                <LineChart
                  data={datosEvolucion}
                  width={isTablet ? 400 : screenWidth - 80}
                  height={220}
                  periodo={periodo}
                />
              ) : (
                <View className="h-[220px] items-center justify-center">
                  <Text className="text-gray-500 dark:text-gray-400">
                    No hay datos para mostrar
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-1 bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-neutral-700">
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Ventas por Categoría
              </Text>
              {datosCategorias.length > 0 &&
              datosCategorias.some((d) => d.total > 0) ? (
                <PieChart data={datosCategorias} size={isTablet ? 220 : 200} />
              ) : (
                <View className="h-[220px] items-center justify-center">
                  <Text className="text-gray-500 dark:text-gray-400">
                    No hay datos para mostrar
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Productos Más y Menos Vendidos */}
          <View className={`gap-4 ${isTablet ? "flex-row" : "flex-col"}`}>
            <View className="flex-1 bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-neutral-700">
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Productos Más Vendidos
              </Text>
              {productosVentas.masVendidos.length > 0 ? (
                <View className="gap-2">
                  {productosVentas.masVendidos.map((pv, index) => (
                    <View
                      key={pv.producto.id}
                      className="flex-row justify-between items-center p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg border border-gray-200 dark:border-neutral-600"
                    >
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <View className="w-7 h-7 rounded-full bg-orange-600 items-center justify-center shadow-sm">
                            <Text className="text-white text-xs font-bold">
                              {index + 1}
                            </Text>
                          </View>
                          <Text
                            className="text-gray-800 dark:text-gray-200 font-semibold flex-1"
                            numberOfLines={1}
                          >
                            {pv.producto.nombre}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2 ml-9">
                          <Text className="text-gray-600 dark:text-gray-400 text-sm">
                            {pv.cantidad} unidades
                          </Text>
                          <Text className="text-gray-400 dark:text-gray-500">
                            •
                          </Text>
                          <Text className="text-orange-600 dark:text-orange-500 font-semibold text-sm">
                            ${pv.total.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-gray-500 dark:text-gray-400">
                    No hay datos disponibles
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-1 bg-white dark:bg-neutral-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-neutral-700">
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Productos Menos Vendidos
              </Text>
              {productosVentas.menosVendidos.length > 0 ? (
                <View className="gap-2">
                  {productosVentas.menosVendidos.map((pv, index) => (
                    <View
                      key={pv.producto.id}
                      className="flex-row justify-between items-center p-3 bg-gray-50 dark:bg-neutral-700 rounded-lg border border-gray-200 dark:border-neutral-600"
                    >
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <View className="w-7 h-7 rounded-full bg-gray-400 dark:bg-gray-500 items-center justify-center shadow-sm">
                            <Text className="text-white text-xs font-bold">
                              {index + 1}
                            </Text>
                          </View>
                          <Text
                            className="text-gray-800 dark:text-gray-200 font-semibold flex-1"
                            numberOfLines={1}
                          >
                            {pv.producto.nombre}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2 ml-9">
                          <Text className="text-gray-600 dark:text-gray-400 text-sm">
                            {pv.cantidad} unidades
                          </Text>
                          <Text className="text-gray-400 dark:text-gray-500">
                            •
                          </Text>
                          <Text className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                            ${pv.total.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-gray-500 dark:text-gray-400">
                    No hay datos disponibles
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// Componente de Gráfico de Línea - MEJORADO
function LineChart({
  data,
  width,
  height,
  periodo,
}: {
  data: { fecha: Date; total: number }[];
  width: number;
  height: number;
  periodo: Periodo;
}) {
  if (data.length === 0) return null;

  const padding = 50;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data.map((d) => d.total), 1);
  const minValue = 0;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y =
      padding +
      chartHeight -
      ((d.total - minValue) / (maxValue - minValue || 1)) * chartHeight;
    return { x, y, value: d.total, fecha: d.fecha };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const isYearly =
    periodo === "año" || (periodo === "personalizado" && data.length === 12);

  return (
    <Svg width={width} height={height}>
      {/* Ejes */}
      <Path
        d={`M ${padding} ${padding} L ${padding} ${height - padding} L ${
          width - padding
        } ${height - padding}`}
        stroke="#e5e7eb"
        strokeWidth="2"
        fill="none"
      />

      {/* Línea del gráfico */}
      <Path d={path} stroke="#ea580c" strokeWidth="3" fill="none" />

      {/* Área bajo la curva */}
      <Path
        d={`${path} L ${points[points.length - 1].x} ${height - padding} L ${
          points[0].x
        } ${height - padding} Z`}
        fill="#ea580c"
        opacity={0.1}
      />

      {/* Puntos */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r="5" fill="#ea580c" />
      ))}

      {/* Etiquetas del eje Y */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const value = minValue + (maxValue - minValue) * ratio;
        const y = padding + chartHeight - ratio * chartHeight;
        return (
          <SvgText
            key={ratio}
            x={padding - 10}
            y={y + 4}
            fontSize="10"
            fill="#6b7280"
            textAnchor="end"
          >
            ${value.toFixed(0)}
          </SvgText>
        );
      })}

      {/* Etiquetas del eje X */}
      {points
        .filter((_, i) => {
          if (isYearly) return i % 2 === 0; // Cada 2 meses
          return i % Math.ceil(data.length / 7) === 0 || i === data.length - 1;
        })
        .map((p, i) => {
          const label = isYearly
            ? p.fecha.toLocaleDateString("es-ES", { month: "short" })
            : p.fecha.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              });
          return (
            <SvgText
              key={i}
              x={p.x}
              y={height - padding + 20}
              fontSize="9"
              fill="#6b7280"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
    </Svg>
  );
}

// Componente de Gráfico de Pie - MEJORADO
function PieChart({
  data,
  size,
}: {
  data: { nombre: string; total: number }[];
  size: number;
}) {
  const colors = [
    "#3b82f6",
    "#ea580c",
    "#10b981",
    "#8b5cf6",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#14b8a6",
  ];
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (total === 0 || data.length === 0) {
    return (
      <View className="items-center justify-center" style={{ height: size }}>
        <Text className="text-gray-500 dark:text-gray-400">No hay datos</Text>
      </View>
    );
  }

  let currentAngle = -90;
  const radius = size / 2 - 30;
  const centerX = size / 2;
  const centerY = size / 2;

  const slices = data.map((d, i) => {
    const percentage = d.total / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
    const largeArc = angle > 180 ? 1 : 0;

    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      path,
      color: colors[i % colors.length],
      percentage: percentage * 100,
      nombre: d.nombre,
      total: d.total,
    };
  });

  return (
    <View className="items-center">
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, i) => (
            <Path
              key={i}
              d={slice.path}
              fill={slice.color}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
        </G>
      </Svg>
      <View className="mt-4 gap-2 w-full">
        {slices.map((slice, i) => (
          <View key={i} className="flex-row items-center gap-2">
            <View
              className="w-4 h-4 rounded"
              style={{ backgroundColor: slice.color }}
            />
            <Text
              className="text-sm text-gray-700 dark:text-gray-300 flex-1"
              numberOfLines={1}
            >
              {slice.nombre}
            </Text>
            <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {slice.percentage.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
