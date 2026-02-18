---
title: Destructure Functions Early in Render (React Compiler)
impact: HIGH
impactDescription: Stable references, fewer re-renders
tags: react-compiler, hooks
---

## Destructure Functions Early in Render (React Compiler)

Only if using React Compiler. Destructure at top of render; don't dot into objects to call functions.

**Incorrect:**

```tsx
const router = useRouter()
const handlePress = () => {
  props.onSave()
  router.push('/success')  // unstable reference
}
```

**Correct:**

```tsx
const { push } = useRouter()
const handlePress = () => {
  onSave()
  push('/success')  // stable reference
}
```
