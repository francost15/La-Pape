import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/colors";
import { AppFonts } from "@/constants/typography";
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from "react-native";

interface ProductoActionsProps {
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

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
          boxShadow: Platform.OS === "web" ? "0 4px 12px rgba(239, 68, 68, 0.1)" : undefined,
          elevation: Platform.OS !== "web" ? 3 : undefined,
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
        className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-[#EA580C] active:opacity-90"
        style={{
          boxShadow: Platform.OS === "web" ? "0 8px 24px rgba(234, 88, 12, 0.3)" : undefined,
          elevation: Platform.OS !== "web" ? 6 : undefined,
        }}
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
