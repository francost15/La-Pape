import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OnboardingStore, TourStep } from "@/interface/onboarding";
import { ONBOARDING_STEPS } from "@/lib/services/onboarding";
import { create } from "zustand";

const TOUR_COMPLETED_KEY = "tours_completed";

export async function resetAllTours(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const tourKeys = keys.filter((k) => k.startsWith(TOUR_COMPLETED_KEY));
  if (tourKeys.length > 0) {
    await AsyncStorage.multiRemove(tourKeys);
  }
  useOnboardingStore.setState({
    isTourOpen: false,
    activeTourId: null,
    tourSteps: [],
    tourStepIndex: 0,
  });
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  isVisible: false,
  currentStepIndex: 0,
  completedSteps: [],
  isLoading: true,

  isTourOpen: false,
  activeTourId: null,
  tourSteps: [],
  tourStepIndex: 0,

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

  startTour: async (tourId, steps) => {
    const completedKey = `${TOUR_COMPLETED_KEY}_${tourId}`;
    const completed = await AsyncStorage.getItem(completedKey);
    if (completed !== "true") {
      set({
        isTourOpen: true,
        activeTourId: tourId,
        tourSteps: steps,
        tourStepIndex: 0,
      });
    }
  },

  closeTour: async () => {
    const { activeTourId } = get();
    if (activeTourId) {
      await AsyncStorage.setItem(`${TOUR_COMPLETED_KEY}_${activeTourId}`, "true");
    }
    set({ isTourOpen: false, tourStepIndex: 0, activeTourId: null, tourSteps: [] });
  },

  nextTourStep: () => {
    const { tourStepIndex, tourSteps } = get();
    if (tourStepIndex < tourSteps.length - 1) {
      set({ tourStepIndex: tourStepIndex + 1 });
    }
  },

  prevTourStep: () => {
    const { tourStepIndex } = get();
    if (tourStepIndex > 0) {
      set({ tourStepIndex: tourStepIndex - 1 });
    }
  },

  completeTour: async () => {
    const { activeTourId } = get();
    if (activeTourId) {
      await AsyncStorage.setItem(`${TOUR_COMPLETED_KEY}_${activeTourId}`, "true");
    }
    set({ isTourOpen: false, tourStepIndex: 0, activeTourId: null, tourSteps: [] });
  },
}));
