---
title: Use GestureDetector for Animated Press States
impact: HIGH
impactDescription: UI thread animations, smoother press feedback
tags: animation, gesture, reanimated
---

## Use GestureDetector for Animated Press States

Use Gesture.Tap() with shared values instead of Pressable's onPressIn/onPressOut. Callbacks run on UI thread.

**Incorrect:**

```tsx
<Pressable
  onPressIn={() => (scale.value = withTiming(0.95))}
  onPressOut={() => (scale.value = withTiming(1))}
>
```

**Correct:**

```tsx
const pressed = useSharedValue(0)
const tap = Gesture.Tap()
  .onBegin(() => pressed.set(withTiming(1)))
  .onFinalize(() => pressed.set(withTiming(0)))
  .onEnd(() => runOnJS(onPress)())

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, 0.95]) }],
}))

return (
  <GestureDetector gesture={tap}>
    <Animated.View style={animatedStyle}>...</Animated.View>
  </GestureDetector>
)
```

**Reference:** [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler)
