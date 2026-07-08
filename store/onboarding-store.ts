import type { OnboardingStore } from "@/interface/onboarding";
import { ONBOARDING_STEPS } from "@/lib/services/onboarding";
import { create } from "zustand";

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  isVisible: false,
  currentStepIndex: 0,
  completedSteps: [],
  isLoading: true,

  show: () => set({ isVisible: true }),

  hide: () => set({ isVisible: false }),

  nextStep: () => {
    const { currentStepIndex, completedSteps } = get();
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    if (currentStep && !completedSteps.includes(currentStep.id)) {
      set({ completedSteps: [...completedSteps, currentStep.id] });
    }
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      set({ isVisible: false });
    }
  },

  skip: () => set({ isVisible: false }),

  setCompletedSteps: (steps) => set({ completedSteps: steps, isLoading: false }),

  getCurrentStep: () => {
    const { currentStepIndex } = get();
    return ONBOARDING_STEPS[currentStepIndex] ?? null;
  },
}));
