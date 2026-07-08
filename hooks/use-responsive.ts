import { DESKTOP_MIN_WIDTH } from "@/constants/design-system";
import { useLayoutStore } from "@/store/layout-store";
import { useWindowDimensions } from "react-native";

/** Fuente única de verdad para layout responsivo (store + dimensiones). */
export function useResponsive() {
  const { width } = useWindowDimensions();
  const isMobileFromStore = useLayoutStore((s) => s.isMobile);
  const isDesktop = width >= DESKTOP_MIN_WIDTH;

  return {
    width,
    isMobile: isMobileFromStore,
    isDesktop,
  };
}
