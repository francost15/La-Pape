import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppFonts } from "@/constants/typography";
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from "react-native";

interface EditProductActionsProps {
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function EditProductActions({ loading, onCancel, onSave }: EditProductActionsProps) {
  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        className="h-12 flex-row items-center justify-center rounded-full border border-gray-200 bg-white px-6 active:opacity-80 dark:border-neutral-800 dark:bg-neutral-800"
        onPress={onCancel}
        disabled={loading}
      >
        <Text
          className="text-sm font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400"
          style={{ fontFamily: AppFonts.bodyStrong }}
        >
          Cancelar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-[#EA580C] active:opacity-90"
        style={{
          boxShadow: Platform.OS === "web" ? "0 8px 24px rgba(234, 88, 12, 0.3)" : undefined,
          elevation: Platform.OS !== "web" ? 6 : undefined,
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
