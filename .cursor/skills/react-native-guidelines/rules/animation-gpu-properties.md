---
title: Animate Transform and Opacity Instead of Layout Properties
impact: HIGH
impactDescription: GPU-accelerated, no layout recalculation
tags: animation, reanimated, performance
---

## Animate Transform and Opacity Instead of Layout Properties

Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding`. Use `transform` and `opacity` (GPU-accelerated).

**Incorrect:**

```tsx
const animatedStyle = useAnimatedStyle(() => ({
  height: withTiming(expanded ? 200 : 0),
  overflow: 'hidden',
}))
// Triggers layout on every frame
```

**Correct: scaleY**

```tsx
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scaleY: withTiming(expanded ? 1 : 0) }],
  opacity: withTiming(expanded ? 1 : 0),
}))
return (
  <Animated.View style={[{ height: 200, transformOrigin: 'top' }, animatedStyle]}>
    {children}
  </Animated.View>
)
```

**Correct: translateY for slide**

```tsx
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: withTiming(visible ? 0 : 100) }],
  opacity: withTiming(visible ? 1 : 0),
}))
```

**Reference:** [Reanimated](https://docs.swmansion.com/react-native-reanimated)
