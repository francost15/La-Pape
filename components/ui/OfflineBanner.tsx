import { View, Text } from "react-native";

export function OfflineBanner() {
  return (
    <View className="bg-amber-500 px-4 py-2">
      <Text className="text-center text-sm text-white">
        Modo offline - algunos datos pueden no estar actualizados
      </Text>
    </View>
  );
}
