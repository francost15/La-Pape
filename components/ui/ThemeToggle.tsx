import { IconSymbol } from "./icon-symbol";
import { AppColors } from "@/constants/colors";
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
      className="flex-row items-center gap-2 rounded-full bg-surface-hover px-3 py-2"
      accessibilityRole="button"
      accessibilityLabel={`Tema: ${label}. Toca para cambiar.`}
    >
      <IconSymbol name={icon} size={20} color={isDark ? "#fbbf24" : AppColors.primaryLight} />
      <Text className="text-sm text-content-secondary">{label}</Text>
    </TouchableOpacity>
  );
}
