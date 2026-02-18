---
title: Use .get() and .set() for Reanimated Shared Values
impact: LOW
impactDescription: Required for React Compiler compatibility
tags: react-compiler, reanimated
---

## Use .get() and .set() for Reanimated Shared Values

With React Compiler, use `.get()` and `.set()` instead of `.value`.

**Incorrect:**

```tsx
count.value = count.value + 1
return <Button title={`Count: ${count.value}`} />
```

**Correct:**

```tsx
count.set(count.get() + 1)
return <Button title={`Count: ${count.get()}`} />
```

**Reference:** [Reanimated docs](https://docs.swmansion.com/react-native-reanimated)
