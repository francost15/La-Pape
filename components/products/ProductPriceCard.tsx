import { formatCurrency } from '@/lib/utils/format';
import { Text, View } from 'react-native';

interface ProductPriceCardProps {
  precioVenta: number;
  precioMayoreo: number;
  costoPromedio: number;
}

/**
 * Card de precios del producto: venta destacado en grande, mayoreo y costo en fila compacta.
 * Usa formatCurrency (es-CL) para consistencia con el resto de la app.
 */
export default function ProductPriceCard({
  precioVenta,
  precioMayoreo,
  costoPromedio,
}: ProductPriceCardProps) {
  return (
    <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-700">
      {/* Precio de venta — el dato más relevante para el vendedor */}
      <View className="px-4 pt-4 pb-3 border-b border-gray-100 dark:border-neutral-700">
        <Text className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
          Precio de Venta
        </Text>
        <Text className="text-3xl font-bold text-orange-600 dark:text-orange-400 tracking-tight">
          {formatCurrency(precioVenta)}
        </Text>
      </View>

      {/* Mayoreo y costo en fila dividida */}
      <View className="flex-row">
        <View className="flex-1 px-4 py-3 border-r border-gray-100 dark:border-neutral-700">
          <Text className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
            Mayoreo
          </Text>
          <Text className="text-base font-bold text-gray-700 dark:text-gray-300">
            {formatCurrency(precioMayoreo)}
          </Text>
        </View>
        <View className="flex-1 px-4 py-3">
          <Text className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
            Costo
          </Text>
          <Text className="text-base font-bold text-gray-700 dark:text-gray-300">
            {formatCurrency(costoPromedio)}
          </Text>
        </View>
      </View>
    </View>
  );
}
