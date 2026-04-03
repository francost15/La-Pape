import { formatCurrency } from '@/lib/utils/format';
import { Platform, Text, View } from 'react-native';
import { AppFonts } from '@/constants/typography';
import { AppColors } from '@/constants/colors';

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
    <View 
      className="bg-white dark:bg-[#1A1F2B] rounded-3xl overflow-hidden p-6"
      style={{ 
        boxShadow: Platform.OS === 'web' ? '0 12px 24px rgba(0,0,0,0.04)' : undefined,
        elevation: Platform.OS !== 'web' ? 4 : undefined
      }}
    >
      <View>
        <Text 
          className="text-[10px] font-bold text-[#9CA3AF] dark:text-[#5A6478] uppercase tracking-[0.2em] mb-1"
          style={{ fontFamily: AppFonts.bodyStrong }}
        >
          PRECIO PÚBLICO
        </Text>
        <Text 
          className="text-4xl text-[#EA580C] dark:text-[#FB923C] tracking-tighter"
          style={{ fontFamily: AppFonts.display, lineHeight: 48 }}
        >
          {formatCurrency(precioVenta)}
        </Text>
      </View>

      <View className="flex-row items-center gap-8 mt-6">
        <View>
          <Text 
            className="text-[10px] font-bold text-[#9CA3AF] dark:text-[#5A6478] uppercase tracking-widest mb-1"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            MAYOREO
          </Text>
          <Text 
            className="text-lg text-[#111827] dark:text-[#F9FAFB] tracking-tight"
            style={{ fontFamily: AppFonts.heading }}
          >
            {formatCurrency(precioMayoreo)}
          </Text>
        </View>
        
        <View className="w-px h-8 bg-[#F3F4F6] dark:bg-[#374151]" />

        <View>
          <Text 
            className="text-[10px] font-bold text-[#9CA3AF] dark:text-[#5A6478] uppercase tracking-widest mb-1"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            COSTO ADQ.
          </Text>
          <Text 
            className="text-lg text-[#6B7280] dark:text-[#9CA3AF] tracking-tight"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            {formatCurrency(costoPromedio)}
          </Text>
        </View>
      </View>
    </View>
  );
}
