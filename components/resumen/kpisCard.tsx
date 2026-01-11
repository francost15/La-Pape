import { Text, View } from "react-native";
interface KpisCardProps {
    title: string;
    value: number;
    transactions: number;
    icon: React.ReactNode;
    color: string;
}
export default function KpisCard({ title, value, transactions, icon, color }: KpisCardProps) {
    return (
        <View className={`flex-1 min-w-[160px] bg-${color}-500 rounded-xl p-4 shadow-lg`}>
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-white/90 text-sm font-medium">{title}</Text>
          <Text className={`text-white text-2xl ${color === 'orange' ? 'text-orange-500' : color === 'green' ? 'text-green-500' : color === 'purple' ? 'text-purple-500' : color === 'red' ? 'text-red-500' : ''}`}>{icon}</Text>
        </View>
        <Text className="text-white text-3xl font-bold mb-1">
          ${value.toFixed(2)}
        </Text>
        <Text className="text-white/80 text-xs">
          {transactions} {transactions > 1 ? 'transacciones' : 'transacción'}
        </Text>
      </View>
    )
}