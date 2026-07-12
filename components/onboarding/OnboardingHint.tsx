import { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useOnboardingStore } from "@/store/onboarding-store";
import { AppColors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  getCompletedSteps,
  markStepCompleted,
  isOnboardingComplete,
} from "@/lib/services/onboarding";
import { useSessionStore } from "@/store/session-store";

export function OnboardingHint() {
  const {
    isVisible,
    currentStepIndex,
    isLoading,
    hide,
    nextStep,
    setCompletedSteps,
    getCurrentStep,
  } = useOnboardingStore();
  const isDark = useColorScheme() === "dark";
  const reduceMotion = useReducedMotion();
  const fadeAnim = useSharedValue(0);
  const currentStep = getCurrentStep();

  useEffect(() => {
    // Reduced motion: saltamos directo a la opacidad final (duration 0) en vez de
    // animar el fade; conservamos el cambio de opacidad para comunicar el estado
    fadeAnim.value = withTiming(isVisible ? 1 : 0, {
      duration: reduceMotion ? 0 : isVisible ? 300 : 200,
    });
  }, [isVisible, fadeAnim, reduceMotion]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));

  useEffect(() => {
    getCompletedSteps().then(setCompletedSteps);
  }, [setCompletedSteps]);

  if (!isVisible || isLoading || !currentStep) return null;

  const handleNext = async () => {
    await markStepCompleted(currentStep.id);
    nextStep();
  };

  const handleSkip = () => {
    hide();
  };

  return (
    <Animated.View
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight, fadeStyle]}
    >
      <View style={styles.arrow} />
      <View style={styles.content}>
        <Text style={[styles.title, isDark ? styles.titleDark : styles.titleLight]}>
          {currentStep.title}
        </Text>
        <Text
          style={[styles.description, isDark ? styles.descriptionDark : styles.descriptionLight]}
        >
          {currentStep.description}
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.skipText, isDark ? styles.skipTextDark : styles.skipTextLight]}>
              Omitir
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.nextButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.nextText}>
              {currentStepIndex === 2 ? "Entendido" : "Siguiente"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export function useOnboardingAfterLogin() {
  const { userId } = useSessionStore();
  const { show, isLoading } = useOnboardingStore();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (userId && !isLoading && !hasShownRef.current) {
      hasShownRef.current = true;
      isOnboardingComplete().then((complete) => {
        if (!complete) {
          show();
        }
      });
    }
  }, [userId, isLoading, show]);
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 16,
    width: 280,
    maxHeight: 200,
    borderRadius: 12,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 8px rgba(0,0,0,0.15)" }
      : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
        }),
  },
  containerLight: {
    backgroundColor: "#ffffff",
  },
  containerDark: {
    backgroundColor: "#262626",
  },
  arrow: {
    position: "absolute",
    bottom: -8,
    right: 24,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  titleLight: {
    color: "#111827",
  },
  titleDark: {
    color: "#f9fafb",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  descriptionLight: {
    color: "#4b5563",
  },
  descriptionDark: {
    color: AppColors.light.textMuted,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  skipTextLight: {
    color: AppColors.light.textSecondary,
  },
  skipTextDark: {
    color: AppColors.light.textMuted,
  },
  nextButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  nextText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
});
