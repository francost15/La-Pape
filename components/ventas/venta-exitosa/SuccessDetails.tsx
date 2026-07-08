import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { SuccessDetailsProps } from "@/interface/ventas";
import { formatCurrency } from "@/lib/utils/format";
import { StyleSheet, Text, View } from "react-native";

export function SuccessDetails({ venta, isDark, colors }: SuccessDetailsProps) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        backgroundColor: isDark ? AppColors.dark.surfaceElevated : "#F8F8F7",
        borderRadius: 14,
        paddingHorizontal: 16,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 14,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.textSecondary, fontFamily: AppFonts.body }}>
          Fecha
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: colors.textPrimary,
            fontFamily: AppFonts.bodyStrong,
          }}
        >
          {venta.fecha}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 18,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.textPrimary,
            fontFamily: AppFonts.bodyStrong,
          }}
        >
          Total
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            color: isDark ? AppColors.primaryLight : AppColors.primary,
            fontFamily: AppFonts.display,
            letterSpacing: -0.5,
          }}
        >
          {formatCurrency(venta.total)}
        </Text>
      </View>
    </View>
  );
}
