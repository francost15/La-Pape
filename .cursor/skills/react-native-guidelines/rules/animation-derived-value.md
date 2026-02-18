---
title: Prefer useDerivedValue Over useAnimatedReaction
impact: MEDIUM
impactDescription: Cleaner code, automatic dependency tracking
tags: animation, reanimated
---

## Prefer useDerivedValue Over useAnimatedReaction

For derivations, use `useDerivedValue`. Use `useAnimatedReaction` only for side effects.

**Incorrect:**

```tsx
useAnimatedReaction(
  () => progress.value,
  (current) => { opacity.value = 1 - current }
)
```

**Correct:**

```tsx
const opacity = useDerivedValue(() => 1 - progress.get())
```

Use `useAnimatedReaction` only for side effects (haptics, runOnJS).
