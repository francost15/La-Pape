import AppText from "@/components/ui/AppText";
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
          <AppText variant="eyebrow" style={{ marginBottom: 4 }}>
            Existencias
          </AppText>
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
          <View className="mb-1.5 flex-row items-center gap-1.5 rounded-full bg-error/10 px-3 py-1.5">
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color={AppColors.error} />
            <Text className="text-[10px] font-bold tracking-widest text-error">
              Crítico
            </Text>
          </View>
        )}
      </View>

      <View className="mt-6 h-2 overflow-hidden rounded-full bg-surface-hover">
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
          <Text className="text-[11px] font-medium tracking-wider text-content-secondary">
            Stock Mínimo
          </Text>
          <Text className="text-[11px] font-bold text-content-secondary tabular-nums">
            {stockMinimo} Unidades
          </Text>
        </View>
      )}
    </View>
  );
}
