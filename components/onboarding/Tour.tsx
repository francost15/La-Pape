import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export interface TourStep {
  id: string;
  target?: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "center";
}

interface TourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function Tour({ steps, isOpen, onClose, onComplete }: TourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { isDark } = useTheme();

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
      onClose();
    } else {
      setCurrentStep((c) => c + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || !step) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
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
