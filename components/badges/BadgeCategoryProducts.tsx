import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppFonts } from "@/constants/typography";
import { AppColors } from "@/constants/colors";
import { Categoria } from "@/interface/categorias";
import { useLayoutStore } from "@/store/layout-store";
import { useHaptic } from "@/hooks/use-haptic";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface BadgeCategoryProductsProps {
  categories: Categoria[];
  orderBy?: "asc" | "desc";
  selectedCategoryId?: string | null;
  onCategoryPress: (categoryId: string | null) => void;
}

const ACTIVE_BG = "#ea580c";

/**
 * BadgeItem — Digital Atelier style.
 *
 * Compact chips for product classification.
 * Navy dark mode and Stone light mode for inactive states.
 */
function BadgeItem({
  label,
  isSelected,
  isDark,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  const haptic = useHaptic();
  const colors = isDark ? AppColors.dark : AppColors.light;
  
  const bgInactive = isDark ? "#1A1F2B" : "#F5F5F4";
  const textInactive = isDark ? "#A1A1AA" : "#71717A";

  return (
    <TouchableOpacity
      onPress={() => {
        haptic();
        onPress();
      }}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: isSelected ? ACTIVE_BG : bgInactive,
        borderWidth: 1,
        borderColor: isSelected ? "transparent" : colors.border,
      }}
      activeOpacity={0.8}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: isSelected ? "700" : "500",
          color: isSelected ? "#FFFFFF" : textInactive,
          letterSpacing: -0.2,
          fontFamily: AppFonts.bodyStrong,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BadgeCategoryProducts({
  categories,
  orderBy = "asc",
  selectedCategoryId,
  onCategoryPress,
}: BadgeCategoryProductsProps) {
  const isMobile = useLayoutStore((s) => s.isMobile);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const sortedCategories = [...categories].sort((a, b) =>
    orderBy === "asc"
      ? a.nombre.localeCompare(b.nombre)
      : b.nombre.localeCompare(a.nombre),
  );

  const handlePress = (categoryId: string | null) => {
    if (selectedCategoryId === categoryId) {
      onCategoryPress(null);
    } else {
      onCategoryPress(categoryId);
    }
  };

  const allBadges = (
    <>
      <BadgeItem
        label="Todos"
        isSelected={selectedCategoryId === null}
        isDark={isDark}
        onPress={() => onCategoryPress(null)}
      />
      {sortedCategories.map((cat) => (
        <BadgeItem
          key={cat.id}
          label={cat.nombre}
          isSelected={selectedCategoryId === cat.id}
          isDark={isDark}
          onPress={() => handlePress(cat.id)}
        />
      ))}
    </>
  );

  if (isMobile) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
        style={{ marginBottom: 12 }}
      >
        {allBadges}
      </ScrollView>
    );
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, paddingVertical: 4, marginBottom: 16 }}>
      {allBadges}
    </View>
  );
}
