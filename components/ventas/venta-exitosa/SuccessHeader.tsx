import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { SuccessHeaderProps } from "@/interface/ventas";
import { Platform, Text, View } from "react-native";
import { IconSymbol } from "../../ui/icon-symbol";

export function SuccessHeader({ colors }: SuccessHeaderProps) {
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
          color: colors.textPrimary,
          letterSpacing: -0.4,
          fontFamily: AppFonts.heading,
          // En native el peso va codificado en el archivo de fuente; un
          // fontWeight explícito fuerza bold sintético. En web sí se declara.
          ...(Platform.OS === "web" ? { fontWeight: "700" as const } : null),
        }}
      >
        ¡Venta Exitosa!
      </Text>
      <Text
        style={{
          fontSize: 14,
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
