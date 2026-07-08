import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { ThemeColors } from "@/hooks/use-theme-colors";
import { Text, View } from "react-native";
import { IconSymbol } from "../../ui/icon-symbol";

export function SuccessHeader({ colors }: { colors: ThemeColors }) {
  return (
    <View
      style={{ alignItems: "center", paddingTop: 36, paddingBottom: 28, paddingHorizontal: 24 }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: "rgba(22,163,74,0.1)", // success @ 10% — halo del ícono
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <IconSymbol name="checkmark.circle.fill" size={48} color={AppColors.success} />
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "700",
          color: colors.textPrimary,
          letterSpacing: -0.4,
          fontFamily: AppFonts.heading,
        }}
      >
        ¡Venta Exitosa!
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "400",
          color: colors.textSecondary,
          marginTop: 6,
          fontFamily: AppFonts.body,
        }}
      >
        La venta se completó correctamente
      </Text>
    </View>
  );
}
