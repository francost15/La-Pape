import type { OnboardingStep } from "@/lib/services/onboarding";

export interface OnboardingStore {
  isVisible: boolean;
  currentStepIndex: number;
  completedSteps: string[];
  isLoading: boolean;
  show: () => void;
  hide: () => void;
  nextStep: () => void;
  skip: () => void;
  setCompletedSteps: (steps: string[]) => void;
  getCurrentStep: () => OnboardingStep | null;

  isTourOpen: boolean;
  activeTourId: string | null;
  tourSteps: TourStep[];
  tourStepIndex: number;
  startTour: (tourId: string, steps: TourStep[]) => Promise<void>;
  closeTour: () => void;
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
