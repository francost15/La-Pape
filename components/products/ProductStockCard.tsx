import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { ProductStockCardProps } from "@/interface/products";
import { shadows } from "@/lib/utils/shadows";
import { Text, View } from "react-native";

/**
 * Card de inventario: muestra stock disponible con semáforo visual y stock mínimo.
 * isCritical = cantidad <= stockMinimo → colores rojo/naranja de alerta.
 */
export default function ProductStockCard({
  cantidad,
  stockMinimo,
  isCritical,
}: ProductStockCardProps) {
  const statusColor = isCritical ? AppColors.error : AppColors.success;

  return (
    <View className="overflow-hidden rounded-3xl bg-surface-elevated p-6" style={shadows.card}>
      <View className="flex-row items-end justify-between">
        <View>
          <Text
            className="mb-1 text-[10px] font-bold tracking-[0.2em] text-content-secondary uppercase"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            Existencias
          </Text>
          <Text
            className="text-4xl tracking-tighter"
            style={{
              fontFamily: AppFonts.display,
              lineHeight: 48,
              color: statusColor,
            }}
          >
            {cantidad}{" "}
            <Text className="text-xl" style={{ fontFamily: AppFonts.heading }}>
              Unidades
            </Text>
          </Text>
        </View>

        {isCritical && (
          <View className="mb-1.5 flex-row items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 dark:bg-red-900/20">
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color={AppColors.error} />
            <Text className="text-[10px] font-bold tracking-widest text-red-600 uppercase dark:text-red-400">
              Crítico
            </Text>
          </View>
        )}
      </View>

      <View className="mt-6 h-2 overflow-hidden rounded-full bg-[#F3F4F6] dark:bg-[#374151]">
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, (cantidad / (stockMinimo || 1)) * 50)}%`,
            backgroundColor: statusColor,
          }}
        />
      </View>

      {stockMinimo != null && (
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-[11px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Stock Mínimo
          </Text>
          <Text className="text-[11px] font-bold text-gray-700 tabular-nums dark:text-gray-300">
            {stockMinimo} Unidades
          </Text>
        </View>
      )}
    </View>
  );
}
