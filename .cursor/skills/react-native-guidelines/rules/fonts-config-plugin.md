---
title: Load Fonts Natively at Build Time
impact: LOW
impactDescription: Fonts available at launch, no async loading
tags: fonts, expo
---

## Load Fonts Natively at Build Time

Use expo-font config plugin to embed fonts at build instead of useFonts or Font.loadAsync.

**Incorrect:**

```tsx
const [fontsLoaded] = useFonts({ 'Geist-Bold': require('./Geist-Bold.otf') })
if (!fontsLoaded) return null
```

**Correct:**

Add fonts to config plugin, run `npx expo prebuild` and rebuild. No loading state needed:

```tsx
<Text style={{ fontFamily: 'Geist-Bold' }}>Hello</Text>
```

**Reference:** [Expo Font](https://docs.expo.dev/versions/latest/sdk/font/)
