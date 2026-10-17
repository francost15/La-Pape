import React from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import type { TourProps } from "@/interface/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

export function Tour({ onComplete }: Pick<TourProps, "onComplete">) {
  const isOpen = useOnboardingStore((s) => s.isTourOpen);
  const steps = useOnboardingStore((s) => s.tourSteps);
  const currentStep = useOnboardingStore((s) => s.tourStepIndex);
  const nextTourStep = useOnboardingStore((s) => s.nextTourStep);
  const prevTourStep = useOnboardingStore((s) => s.prevTourStep);
  const closeTour = useOnboardingStore((s) => s.closeTour);
  const completeTour = useOnboardingStore((s) => s.completeTour);
  const { isDark } = useTheme();

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
          className={`absolute right-4 bottom-8 left-4 mx-auto max-w-sm rounded-2xl p-5 ${
            isDark ? "bg-neutral-800" : "bg-white"
          }`}
          style={Platform.OS === "web" ? { boxShadow: "0 20px 50px rgba(0,0,0,0.3)" } : undefined}
        >
          <View className="mb-4 flex-row justify-center gap-2">
            {steps.map((_, i) => (
              <View
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === currentStep ? "bg-orange-500" : "bg-gray-300 dark:bg-neutral-600"
                }`}
              />
            ))}
          </View>

          <Text className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{step.title}</Text>

          <Text className="mb-5 text-sm text-gray-600 dark:text-gray-400">{step.description}</Text>

          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleSkip}>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Omitir</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              {currentStep > 0 && (
                <TouchableOpacity
                  onPress={handlePrev}
                  className="rounded-lg border border-gray-200 px-4 py-2 dark:border-neutral-600"
                >
                  <Text className="text-gray-700 dark:text-gray-300">Atrás</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleNext} className="rounded-lg bg-orange-500 px-5 py-2">
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
