import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import type { ProductoActionsProps } from "@/interface/products";
import { shadow } from "@/lib/utils/shadows";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export function ProductoActions({ deleting, onEdit, onDelete }: ProductoActionsProps) {
  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={onDelete}
        disabled={deleting}
        className="h-12 w-12 flex-row items-center justify-center rounded-full active:opacity-80"
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          borderWidth: 1,
          borderColor: "rgba(239, 68, 68, 0.1)",
          ...shadow("0 4px 12px rgba(239, 68, 68, 0.1)", 3),
        }}
        accessibilityRole="button"
        accessibilityLabel="Eliminar producto"
      >
        {deleting ? (
          <ActivityIndicator color={AppColors.error} size="small" />
        ) : (
          <IconSymbol name="trash.fill" size={18} color={AppColors.error} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onEdit}
        disabled={deleting}
        className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-accent active:opacity-90"
        style={shadow("0 8px 24px rgba(234, 88, 12, 0.3)", 6)}
        accessibilityRole="button"
        accessibilityLabel="Editar producto"
      >
        <IconSymbol name="pencil" size={16} color="white" />
        <Text
          className="text-[15px] font-bold tracking-wide text-white"
          style={{ fontFamily: AppFonts.bodyStrong }}
        >
          EDITAR PRODUCTO
        </Text>
      </TouchableOpacity>
    </View>
  );
}
