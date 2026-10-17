import type { TourProps } from "@/interface/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";

export function Tour({ onComplete }: Pick<TourProps, "onComplete">) {
  const isOpen = useOnboardingStore((s) => s.isTourOpen);
  const steps = useOnboardingStore((s) => s.tourSteps);
  const currentStep = useOnboardingStore((s) => s.tourStepIndex);
  const nextTourStep = useOnboardingStore((s) => s.nextTourStep);
  const prevTourStep = useOnboardingStore((s) => s.prevTourStep);
  const closeTour = useOnboardingStore((s) => s.closeTour);
  const completeTour = useOnboardingStore((s) => s.completeTour);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (isLast) {
      onComplete?.();
      await completeTour();
    } else {
      nextTourStep();
    }
  };

  const handlePrev = () => {
    prevTourStep();
  };

  const handleSkip = async () => {
    await closeTour();
  };

  if (!isOpen || !step) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={async () => {
        await closeTour();
      }}
    >
      <View className="flex-1 bg-black/60">
        <View
          className="absolute right-4 bottom-8 left-4 mx-auto max-w-sm rounded-2xl bg-surface-elevated p-5"
          style={Platform.OS === "web" ? { boxShadow: "0 20px 50px rgba(0,0,0,0.3)" } : undefined}
        >
          <View className="mb-4 flex-row justify-center gap-2">
            {steps.map((tourStep, i) => (
              <View
                key={tourStep.id}
                className={`h-2 w-2 rounded-full ${
                  i === currentStep ? "bg-accent" : "bg-line-strong"
                }`}
              />
            ))}
          </View>

          <Text className="mb-2 text-lg font-bold text-content-primary">{step.title}</Text>

          <Text className="mb-5 text-sm text-content-secondary">{step.description}</Text>

          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleSkip}>
              <Text className="text-sm text-content-secondary">Omitir</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              {currentStep > 0 && (
                <TouchableOpacity
                  onPress={handlePrev}
                  className="rounded-lg border border-line-strong px-4 py-2"
                >
                  <Text className="text-content-secondary">Atrás</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleNext} className="rounded-lg bg-accent px-5 py-2">
                <Text className="font-semibold text-white">
                  {isLast ? "Terminar" : "Siguiente"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
