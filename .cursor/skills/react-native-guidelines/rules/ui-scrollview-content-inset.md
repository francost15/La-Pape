---
title: Use contentInset for Dynamic ScrollView Spacing
impact: LOW
impactDescription: Smoother updates, no layout recalculation
tags: ui, scrollview, keyboard
---

## Use contentInset for Dynamic ScrollView Spacing

For spacing that may change (keyboard, toolbars), use contentInset instead of padding.

**Incorrect:**

```tsx
<ScrollView contentContainerStyle={{ paddingBottom: bottomOffset }} />
```

**Correct:**

```tsx
<ScrollView
  contentInset={{ bottom: bottomOffset }}
  scrollIndicatorInsets={{ bottom: bottomOffset }}
>
```

Use scrollIndicatorInsets alongside. For static spacing, padding is fine.
