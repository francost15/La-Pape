import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform, Text, View } from "react-native";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";

interface ProductStockCardProps {
  cantidad: number;
  stockMinimo: number | null | undefined;
  isCritical: boolean;
}

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
    <View
      className="overflow-hidden rounded-3xl bg-white p-6 dark:bg-[#1A1F2B]"
      style={{
        boxShadow: Platform.OS === "web" ? "0 12px 24px rgba(0,0,0,0.04)" : undefined,
        elevation: Platform.OS !== "web" ? 4 : undefined,
      }}
    >
      <View className="flex-row items-end justify-between">
        <View>
          <Text
            className="mb-1 text-[10px] font-bold tracking-[0.2em] text-[#6B7280] uppercase dark:text-[#8B95A5]"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            EXISTENCIAS
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
              UNIDADES
            </Text>
          </Text>
        </View>

        {isCritical && (
          <View className="mb-1.5 flex-row items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 dark:bg-red-900/20">
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color={AppColors.error} />
            <Text className="text-[10px] font-bold tracking-widest text-red-600 uppercase dark:text-red-400">
              CRÍTICO
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
            STOCK MÍNIMO REQUERIDO
          </Text>
          <Text className="text-[11px] font-bold text-gray-700 tabular-nums dark:text-gray-300">
            {stockMinimo} UD.
          </Text>
        </View>
      )}
    </View>
  );
}
