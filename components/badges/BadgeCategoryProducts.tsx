import Button from "@/components/ui/Button";
import type { BadgeCategoryProductsProps } from "@/interface/products";
import { useLayoutStore } from "@/store/layout-store";
import { ScrollView, View } from "react-native";

function CategoryChip({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      title={label}
      variant={isSelected ? "primary" : "secondary"}
      size="sm"
      fullWidth={false}
      onPress={onPress}
      accessibilityState={{ selected: isSelected }}
    />
  );
}

export default function BadgeCategoryProducts({
  categories,
  orderBy = "asc",
  selectedCategoryId,
  onCategoryPress,
}: BadgeCategoryProductsProps) {
  const isMobile = useLayoutStore((s) => s.isMobile);

  const sortedCategories = [...categories].sort((a, b) =>
    orderBy === "asc" ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre)
  );

  const handlePress = (categoryId: string | null) => {
    onCategoryPress(selectedCategoryId === categoryId ? null : categoryId);
  };

  const chips = (
    <>
      <CategoryChip
        label="Todos"
        isSelected={selectedCategoryId === null}
        onPress={() => handlePress(null)}
      />
      {sortedCategories.map((cat) => (
        <CategoryChip
          key={cat.id}
          label={cat.nombre}
          isSelected={selectedCategoryId === cat.id}
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
        {chips}
      </ScrollView>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginBottom: 16,
      }}
    >
      {chips}
    </View>
  );
}
