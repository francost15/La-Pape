import type { LayoutStore } from "@/interface/layout";
import { create } from "zustand";

const BREAKPOINT_MOBILE = 768;

export const useLayoutStore = create<LayoutStore>((set) => ({
  viewportWidth: 0,
  isMobile: true,

  setViewportWidth: (width) =>
    set({
      viewportWidth: width,
      isMobile: width < BREAKPOINT_MOBILE,
    }),
}));
