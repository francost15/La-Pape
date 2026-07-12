import { useHaptic } from "@/hooks/use-haptic";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { CardProductsProps } from "@/interface/products";
import { goToProductDetail } from "@/lib/navigation/go-to-product";
import { useLayoutStore } from "@/store/layout-store";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { CardProductCompact } from "./card-product/CardProductCompact";
import { CardProductDesktop } from "./card-product/CardProductDesktop";

/**
 * CardProducts — Digital Atelier style.
 * Enruta a la variante correcta: compacta (mobile/ranking/stock) o card desktop.
 */
export default React.memo(function CardProducts({
  product,
  variant = "default",
  rankingData,
  rank,
  stockData,
}: CardProductsProps) {
  const isMobile = useLayoutStore((s) => s.isMobile);
  const { isDark, colors } = useThemeColors();
  const [imageError, setImageError] = useState(false);
  const haptic = useHaptic();
  const hapticMedium = useHaptic(Haptics.ImpactFeedbackStyle.Medium);

  const handleCardPress = () => {
    haptic();
    goToProductDetail(product);
  };

  const hasImage = Boolean(product.imagen?.trim());
  const isRanking = variant === "ranking" && !!rankingData;
  const isStock = variant === "stock";

  const shared = {
    product,
    isDark,
    colors,
    hasImage,
    imageError,
    onImageError: () => setImageError(true),
  };

  if (isStock) {
    return (
      <CardProductCompact
        mode="stock"
        {...shared}
        onPress={handleCardPress}
        stockData={stockData}
      />
    );
  }
  if (isRanking) {
    return (
      <CardProductCompact
        mode="ranking"
        {...shared}
        onPress={handleCardPress}
        rankingData={rankingData}
        rank={rank}
      />
    );
  }
  if (isMobile) {
    return <CardProductCompact mode="mobile" {...shared} onPress={handleCardPress} />;
  }
  return (
    <CardProductDesktop
      {...shared}
      onPress={() => goToProductDetail(product)}
      onPressIn={hapticMedium}
    />
  );
});
