import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppFonts } from "@/constants/typography";
import type { EditProductActionsProps } from "@/interface/products";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export function EditProductActions({ loading, onCancel, onSave }: EditProductActionsProps) {
  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        className="h-12 flex-row items-center justify-center rounded-full border border-line-strong bg-surface-elevated px-6 active:opacity-80"
        onPress={onCancel}
        disabled={loading}
      >
        <Text
          className="text-sm font-bold tracking-wide text-content-secondary"
          style={{ fontFamily: AppFonts.bodyStrong }}
        >
          Cancelar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-accent active:opacity-90"
        style={{
          boxShadow: "0 8px 24px rgba(234, 88, 12, 0.3)",
        }}
        onPress={onSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <IconSymbol name="checkmark" size={16} color="white" />
            <Text
              className="text-[14px] font-bold tracking-widest text-white"
              style={{ fontFamily: AppFonts.bodyStrong }}
            >
              GUARDAR CAMBIOS
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
