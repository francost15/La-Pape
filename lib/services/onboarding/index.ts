import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@onboarding_completed";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetArea: "cart" | "products" | "search" | "history" | "resumen";
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "add_products",
    title: "Agrega productos",
    description: "Busca y agrega productos a tu carrito tocando el ícono +",
    targetArea: "products",
  },
  {
    id: "complete_sale",
    title: "Completa la venta",
    description: 'Revisa tu carrito y presiona "Completar venta"',
    targetArea: "cart",
  },
  {
    id: "check_history",
    title: "Revisa tu historial",
    description: "Todas tus ventas aparecen en la pestaña Historial",
    targetArea: "history",
  },
];

export async function getCompletedSteps(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function markStepCompleted(stepId: string): Promise<void> {
  try {
    const completed = await getCompletedSteps();
    if (!completed.includes(stepId)) {
      completed.push(stepId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  } catch {
    // Silent fail
  }
}

export async function isOnboardingComplete(): Promise<boolean> {
  const completed = await getCompletedSteps();
  return completed.length >= ONBOARDING_STEPS.length;
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent fail
  }
}
