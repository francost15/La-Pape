import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const currentStep = getCurrentStep();

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim]);

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
      style={[
        styles.container,
        isDark ? styles.containerDark : styles.containerLight,
        { opacity: fadeAnim },
      ]}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    color: "#9ca3af",
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
    color: "#6b7280",
  },
  skipTextDark: {
    color: "#9ca3af",
  },
  nextButton: {
    backgroundColor: "#ea580c",
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
