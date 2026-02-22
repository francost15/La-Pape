import { useColorScheme } from "@/hooks/use-color-scheme";
import { Categoria } from "@/interface/categorias";
import { useLayoutStore } from "@/store/layout-store";
import * as Haptics from "expo-haptics";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface BadgeCategoryProductsProps {
  categories: Categoria[];
  orderBy?: "asc" | "desc";
  selectedCategoryId?: string | null;
  onCategoryPress: (categoryId: string | null) => void;
}

const ACTIVE_BG = "#ea580c";

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
  const bgInactive = isDark ? "#2C2C2E" : "#F2F2F7";
  const textInactive = isDark ? "#E5E5EA" : "#3A3A3C";

  return (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: isSelected ? ACTIVE_BG : bgInactive,
      }}
      activeOpacity={0.8}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: isSelected ? "600" : "500",
          color: isSelected ? "#FFFFFF" : textInactive,
          letterSpacing: -0.1,
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
        contentContainerStyle={{ paddingHorizontal: 10, gap: 8, paddingVertical: 4 }}
        style={{ marginBottom: 16 }}
      >
        {allBadges}
      </ScrollView>
    );
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 16 }}>
      {allBadges}
    </View>
  );
}
