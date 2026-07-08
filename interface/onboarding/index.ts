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
}
