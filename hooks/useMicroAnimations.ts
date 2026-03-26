import { useSharedValue, withTiming, withSpring, withSequence } from "react-native-reanimated";
import { DesignSystem } from "@/constants/design-system";

export function useScaleAnimation(trigger: boolean, scale = 0.95) {
  const animated = useSharedValue(1);

  if (trigger) {
    animated.value = withSpring(scale, {
      damping: 8,
      stiffness: 400,
    });
  } else {
    animated.value = withSpring(1, {
      damping: 8,
      stiffness: 400,
    });
  }

  return { animated, targetScale: trigger ? scale : 1 };
}

export function useShakeAnimation() {
  const offset = useSharedValue(0);

  const shake = () => {
    offset.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  return { offset, shake };
}

export function usePulseAnimation() {
  const scale = useSharedValue(1);

  const pulse = () => {
    scale.value = withSequence(
      withSpring(1.15, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 4, stiffness: 300 })
    );
  };

  return { scale, pulse };
}

export function useBounceAddAnimation() {
  const scale = useSharedValue(1);

  const bounceAdd = () => {
    scale.value = withSequence(
      withSpring(0.85, { damping: 6, stiffness: 500 }),
      withSpring(1.1, { damping: 4, stiffness: 400 }),
      withSpring(1, { damping: 6, stiffness: 400 })
    );
  };

  return { scale, bounceAdd };
}

export function useFadeOutAnimation(onComplete?: () => void) {
  const opacity = useSharedValue(1);

  const fadeOut = (delay = 0) => {
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: DesignSystem.animations.normal });
      if (onComplete) {
        setTimeout(onComplete, DesignSystem.animations.normal);
      }
    }, delay);
  };

  return { opacity, fadeOut };
}

export function useStaggeredFadeOut(itemCount: number, onAllComplete?: () => void) {
  const opacityValues = Array.from({ length: itemCount }, () => useSharedValue(1));

  const fadeOutAll = () => {
    opacityValues.forEach((opacity, index) => {
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: DesignSystem.animations.fast });
      }, index * 50);
    });

    if (onAllComplete) {
      setTimeout(onAllComplete, itemCount * 50 + DesignSystem.animations.fast);
    }
  };

  return { opacityValues, fadeOutAll };
}

export function useSuccessAnimation() {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const playSuccess = () => {
    opacity.value = withTiming(1, { duration: DesignSystem.animations.fast });
    scale.value = withSequence(
      withSpring(0, { damping: 4, stiffness: 200 }),
      withSpring(1.2, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 6, stiffness: 350 })
    );
  };

  const reset = () => {
    scale.value = 0;
    opacity.value = 0;
  };

  return { scale, opacity, playSuccess, reset };
}
