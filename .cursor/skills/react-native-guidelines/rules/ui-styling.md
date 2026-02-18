---
title: Modern React Native Styling Patterns
impact: MEDIUM
impactDescription: Consistent design, smoother borders
tags: ui, styling, tailwind
---

## Modern React Native Styling Patterns

- **borderCurve: 'continuous'** with borderRadius
- **gap** instead of margin for spacing between elements
- **padding** for space within, gap for space between
- **experimental_backgroundImage** for gradients: `'linear-gradient(to bottom, #000, #fff)'`
- **boxShadow** string: `'0 2px 8px rgba(0, 0, 0, 0.1)'`
- **Font hierarchy**: use weight and color, not multiple font sizes

```tsx
// Incorrect – margin
<View><Text style={{ marginBottom: 8 }}>Title</Text></View>
// Correct – gap
<View style={{ gap: 8 }}><Text>Title</Text></View>
```
