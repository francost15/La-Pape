import { IconSymbol } from '@/components/ui/icon-symbol';
import { Platform, Text, View } from 'react-native';
import { AppFonts } from '@/constants/typography';
import { AppColors } from '@/constants/colors';

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
  const statusColor = isCritical ? AppColors.error : AppColors.success;
  
  return (
    <View 
      className="bg-white dark:bg-[#1A1F2B] rounded-3xl overflow-hidden p-6"
      style={{ 
        boxShadow: Platform.OS === 'web' ? '0 12px 24px rgba(0,0,0,0.04)' : undefined,
        elevation: Platform.OS !== 'web' ? 4 : undefined
      }}
    >
      <View className="flex-row items-end justify-between">
        <View>
          <Text 
            className="text-[10px] font-bold text-[#9CA3AF] dark:text-[#5A6478] uppercase tracking-[0.2em] mb-1"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            EXISTENCIAS
          </Text>
          <Text 
            className="text-4xl tracking-tighter"
            style={{ 
              fontFamily: AppFonts.display, 
              lineHeight: 48,
              color: statusColor
            }}
          >
            {cantidad} <Text className="text-xl" style={{ fontFamily: AppFonts.heading }}>UNIDADES</Text>
          </Text>
        </View>

        {isCritical && (
          <View className="bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full flex-row items-center gap-1.5 mb-1.5">
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color={AppColors.error} />
            <Text className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">CRÍTICO</Text>
          </View>
        )}
      </View>

      <View className="h-2 bg-[#F3F4F6] dark:bg-[#374151] rounded-full mt-6 overflow-hidden">
        <View 
          className="h-full rounded-full" 
          style={{ 
            width: `${Math.min(100, (cantidad / (stockMinimo || 1)) * 50)}%`,
            backgroundColor: statusColor 
          }} 
        />
      </View>

      {stockMinimo != null && (
        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">STOCK MÍNIMO REQUERIDO</Text>
          <Text className="text-[11px] font-bold text-gray-700 dark:text-gray-300 tabular-nums">{stockMinimo} UD.</Text>
        </View>
      )}
    </View>
  );
}
