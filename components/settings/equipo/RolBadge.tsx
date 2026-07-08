import type { UserRole } from "@/interface";
import { Text, View } from "react-native";
import { ROL_CLASSES, ROL_LABELS } from "./roles";

export function RolBadge({ rol }: { rol: UserRole }) {
  const c = ROL_CLASSES[rol];
  return (
    <View className={`rounded-full px-2.5 py-1 ${c.bg} ${c.darkBg}`}>
      <Text className={`text-xs font-semibold ${c.text} ${c.darkText}`}>{ROL_LABELS[rol]}</Text>
    </View>
  );
}
