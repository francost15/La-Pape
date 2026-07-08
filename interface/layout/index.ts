export interface LayoutStore {
  viewportWidth: number;
  isMobile: boolean;
  setViewportWidth: (width: number) => void;
}
