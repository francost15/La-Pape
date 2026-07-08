import type { Product } from "@/interface/products";
import { useHaptic } from "@/hooks/use-haptic";
import { useVentasStore } from "@/store/ventas-store";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";

interface UseCartProductActionsOptions {
  onProductAdded?: () => void;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

/** Handlers de carrito compartidos entre ProductCardMobile y ProductItemVenta. */
export function useCartProductActions(
  product: Product,
  {
    onProductAdded,
    hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  }: UseCartProductActionsOptions = {}
) {
  const haptic = useHaptic(hapticStyle);
  const hapticMedium = useHaptic(Haptics.ImpactFeedbackStyle.Medium);

  const addItem = useVentasStore((s) => s.addItem);
  const updateQuantity = useVentasStore((s) => s.updateQuantity);
  const removeItem = useVentasStore((s) => s.removeItem);
  const quantity =
    useVentasStore((s) => s.items.find((i) => i.productId === product.id)?.quantity) ?? 0;
  const inCart = quantity > 0;

  const handleAdd = useCallback(() => {
    if (!inCart) {
      hapticMedium();
      addItem(product, 1);
      onProductAdded?.();
    }
  }, [inCart, hapticMedium, addItem, product, onProductAdded]);

  const handlePlus = useCallback(() => {
    haptic();
    updateQuantity(product.id, quantity + 1);
  }, [haptic, product.id, quantity, updateQuantity]);

  const handleMinus = useCallback(() => {
    haptic();
    if (quantity === 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  }, [haptic, product.id, quantity, removeItem, updateQuantity]);

  return { quantity, inCart, handleAdd, handlePlus, handleMinus };
}
