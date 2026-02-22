import { useLayoutStore } from "@/store/layout-store";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";

/**
 * Sincroniza las dimensiones del viewport con el layout store.
 * Montar una vez en el layout raíz.
 */
export default function LayoutSync() {
  const { width } = useWindowDimensions();
  const setViewportWidth = useLayoutStore((s) => s.setViewportWidth);

  useEffect(() => {
    setViewportWidth(width);
  }, [width, setViewportWidth]);

  return null;
}
