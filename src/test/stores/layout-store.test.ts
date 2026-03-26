import { describe, it, expect, beforeEach } from "vitest";
import { useLayoutStore } from "@/store/layout-store";

describe("LayoutStore", () => {
  beforeEach(() => {
    useLayoutStore.setState({
      viewportWidth: 0,
      isMobile: true,
    });
  });

  it("should have initial state", () => {
    expect(useLayoutStore.getState().viewportWidth).toBe(0);
    expect(useLayoutStore.getState().isMobile).toBe(true);
  });

  it("should set viewportWidth and isMobile to false when width >= 768", () => {
    useLayoutStore.getState().setViewportWidth(1200);
    expect(useLayoutStore.getState().viewportWidth).toBe(1200);
    expect(useLayoutStore.getState().isMobile).toBe(false);
  });

  it("should set isMobile to true when width < 768", () => {
    useLayoutStore.getState().setViewportWidth(600);
    expect(useLayoutStore.getState().viewportWidth).toBe(600);
    expect(useLayoutStore.getState().isMobile).toBe(true);
  });

  it("should set isMobile to false when width is exactly 768", () => {
    useLayoutStore.getState().setViewportWidth(768);
    expect(useLayoutStore.getState().viewportWidth).toBe(768);
    expect(useLayoutStore.getState().isMobile).toBe(false);
  });
});
