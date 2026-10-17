import AsyncStorage from "@react-native-async-storage/async-storage";
import type { OnboardingStore } from "@/interface/onboarding";
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
  isTourOpen: false,
  activeTourId: null,
  tourSteps: [],
  tourStepIndex: 0,

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
