import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text, View } from 'react-native';

interface ProductStockCardProps {
  cantidad: number;
  stockMinimo: number | null | undefined;
  isCritical: boolean;
}

/**
 * Card de inventario: muestra stock disponible con semáforo visual y stock mínimo.
 * isCritical = cantidad <= stockMinimo → colores rojo/naranja de alerta.
 */
export default function ProductStockCard({ cantidad, stockMinimo, isCritical }: ProductStockCardProps) {
  return (
    <View className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-700">
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-neutral-700">
        <Text className="text-sm text-gray-600 dark:text-gray-400">Stock disponible</Text>
        <View className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full ${
          isCritical ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
        }`}>
          {isCritical ? (
            <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#dc2626" />
          ) : null}
          <Text className={`text-sm font-bold tabular-nums ${
            isCritical ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {cantidad} ud.
          </Text>
        </View>
      </View>

      {stockMinimo != null ? (
        <View className="flex-row items-center justify-between px-4 py-3.5">
          <Text className="text-sm text-gray-600 dark:text-gray-400">Stock mínimo</Text>
          <Text className={`text-sm font-semibold tabular-nums ${
            isCritical ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {stockMinimo} ud.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
