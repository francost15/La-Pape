---
title: Use Functional setState Updates
impact: MEDIUM
impactDescription: Avoids stale closures
tags: react, state, useState
---

## Use Functional setState Updates

When next state depends on current, use `setState(prev => ...)` instead of reading state in callback.

**Incorrect:**

```tsx
const onLayout = (e) => {
  const { width, height } = e.nativeEvent.layout
  if (size?.width !== width || size?.height !== height) {
    setSize({ width, height })
  }
}
const onTap = () => setCount(count + 1)
```

**Correct:**

```tsx
const onLayout = (e) => {
  const { width, height } = e.nativeEvent.layout
  setSize((prev) => {
    if (prev?.width === width && prev?.height === height) return prev
    return { width, height }
  })
}
const onTap = () => setCount((prev) => prev + 1)
```
