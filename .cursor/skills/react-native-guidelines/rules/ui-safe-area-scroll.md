---
title: Use contentInsetAdjustmentBehavior for Safe Areas
impact: MEDIUM
impactDescription: Native safe area handling, no layout shifts
tags: ui, safe-area, scrollview
---

## Use contentInsetAdjustmentBehavior for Safe Areas

Use `contentInsetAdjustmentBehavior="automatic"` on root ScrollView instead of SafeAreaView or manual padding.

**Incorrect:**

```tsx
<SafeAreaView><ScrollView>...</ScrollView></SafeAreaView>
// or
contentContainerStyle={{ paddingTop: insets.top }}
```

**Correct:**

```tsx
<ScrollView contentInsetAdjustmentBehavior="automatic">
  <View>...</View>
</ScrollView>
```

Native approach handles keyboard, toolbars, and scroll-behind status bar.
