import { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TourStep } from "@/components/onboarding/Tour";

const TOUR_COMPLETED_KEY = "tours_completed";

export function useTour(tourId: string, steps: TourStep[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [completedKey] = useState(`${TOUR_COMPLETED_KEY}_${tourId}`);

  const startTour = useCallback(async () => {
    const completed = await AsyncStorage.getItem(completedKey);
    if (completed !== "true") {
      setIsOpen(true);
    }
  }, [completedKey]);

  const completeTour = useCallback(async () => {
    await AsyncStorage.setItem(completedKey, "true");
    setIsOpen(false);
  }, [completedKey]);

  const resetTour = useCallback(async () => {
    await AsyncStorage.removeItem(completedKey);
  }, [completedKey]);

  return { isOpen, startTour, completeTour, resetTour };
}

export async function resetAllTours(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const tourKeys = keys.filter((k) => k.startsWith(TOUR_COMPLETED_KEY));
  if (tourKeys.length > 0) {
    await AsyncStorage.multiRemove(tourKeys);
  }
}
