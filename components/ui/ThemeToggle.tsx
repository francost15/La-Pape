import { IconSymbol } from "./icon-symbol";
import { useTheme } from "@/hooks/useTheme";
import { Text, TouchableOpacity } from "react-native";

export function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();

  const icon =
    theme === "system" ? "circle.lefthalf.filled" : isDark ? "moon.fill" : "sun.max.fill";

  const label = theme === "system" ? "Sistema" : isDark ? "Oscuro" : "Claro";

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="flex-row items-center gap-2 rounded-full bg-gray-100 px-3 py-2 dark:bg-neutral-800"
      accessibilityRole="button"
      accessibilityLabel={`Tema: ${label}. Toca para cambiar.`}
    >
      <IconSymbol name={icon} size={20} color={isDark ? "#fbbf24" : "#f97316"} />
      <Text className="text-sm text-gray-700 dark:text-gray-300">{label}</Text>
    </TouchableOpacity>
  );
}
