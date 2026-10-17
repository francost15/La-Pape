export interface OnboardingStore {
  isTourOpen: boolean;
  activeTourId: string | null;
  tourSteps: TourStep[];
  tourStepIndex: number;
  startTour: (tourId: string, steps: TourStep[]) => Promise<void>;
  closeTour: () => Promise<void>;
  nextTourStep: () => void;
  prevTourStep: () => void;
  completeTour: () => Promise<void>;
}

export interface TourStep {
  id: string;
  target?: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "center";
}

export interface TourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}
