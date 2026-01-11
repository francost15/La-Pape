import { Text, View } from "react-native";
interface KpisCardProps {
  title: string;
  value: number;
  transactions: number;
  icon: React.ReactNode;
  className?: string;
}
export default function KpisCard({
  title,
  value,
  transactions,
  icon,
  className,
}: KpisCardProps) {
  return (
    <View
      className={`flex-1 min-w-[160px] rounded-xl p-4 shadow-lg ${className}`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-white/90 text-sm font-medium">{title}</Text>
        <Text className={`text-white text-2xl `}>{icon}</Text>
      </View>
      <Text className="text-white text-3xl font-bold mb-1">
        ${value.toFixed(2)}
      </Text>
      <Text className="text-white/80 text-xs">
        {transactions} {transactions > 1 ? "transacciones" : "transacción"}
      </Text>
    </View>
  );
}
