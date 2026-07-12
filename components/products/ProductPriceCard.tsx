import AppText from "@/components/ui/AppText";
import { AppFonts } from "@/constants/typography";
import type { ProductPriceCardProps } from "@/interface/products";
import { formatCurrency } from "@/lib/utils/format";
import { shadows } from "@/lib/utils/shadows";
import { Text, View } from "react-native";

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
    <View className="overflow-hidden rounded-3xl bg-surface-elevated p-6" style={shadows.card}>
      <View>
        <AppText variant="eyebrow" style={{ marginBottom: 4 }}>
          Precio Publico
        </AppText>
        <Text
          className="text-4xl tracking-tighter text-[#EA580C] dark:text-[#FB923C]"
          style={{ fontFamily: AppFonts.display, lineHeight: 48 }}
        >
          {formatCurrency(precioVenta)}
        </Text>
      </View>

      <View className="mt-6 flex-row items-center gap-8">
        <View>
          <AppText variant="eyebrow" style={{ marginBottom: 4 }}>
            Precio Mayoreo
          </AppText>
          <Text
            className="text-lg tracking-tight text-[#111827] dark:text-[#F9FAFB]"
            style={{ fontFamily: AppFonts.heading }}
          >
            {formatCurrency(precioMayoreo)}
          </Text>
        </View>

        <View className="h-8 w-px bg-[#F3F4F6] dark:bg-[#374151]" />

        <View>
          <AppText variant="eyebrow" style={{ marginBottom: 4 }}>
            Costo Adquisición
          </AppText>
          <Text
            className="text-lg tracking-tight text-[#6B7280] dark:text-[#9CA3AF]"
            style={{ fontFamily: AppFonts.bodyStrong }}
          >
            {formatCurrency(costoPromedio)}
          </Text>
        </View>
      </View>
    </View>
  );
}
