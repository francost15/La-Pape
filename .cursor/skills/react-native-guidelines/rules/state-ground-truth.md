---
title: State Must Represent Ground Truth
impact: HIGH
impactDescription: Cleaner logic, single source of truth
tags: state, reanimated, architecture
---

## State Must Represent Ground Truth

State (useState, shared values) should represent actual state (pressed, progress, isOpen), not derived visual values (scale, opacity). Derive visuals via interpolation.

**Incorrect:**

```tsx
const scale = useSharedValue(1)
tap.onBegin(() => scale.set(withTiming(0.95)))
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.get() }],
}))
```

**Correct:**

```tsx
const pressed = useSharedValue(0)
tap.onBegin(() => pressed.set(withTiming(1)))
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: interpolate(pressed.get(), [0, 1], [1, 0.95]) }],
}))
```

Same for React: derive `height` from `isExpanded`, don't sync in useEffect.
