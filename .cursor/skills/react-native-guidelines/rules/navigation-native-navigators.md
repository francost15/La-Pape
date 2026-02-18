---
title: Use Native Navigators for Navigation
impact: HIGH
impactDescription: Native performance, platform-appropriate UI
tags: navigation, react-navigation, expo-router
---

## Use Native Navigators for Navigation

Use native navigators instead of JS-based ones for better performance and native behavior.

**Stack:** `@react-navigation/native-stack` or expo-router (default). Avoid `@react-navigation/stack`.

**Tabs:** `react-native-bottom-tabs` or expo-router native tabs. Avoid `@react-navigation/bottom-tabs`.

**Incorrect: JS stack**

```tsx
import { createStackNavigator } from '@react-navigation/stack'
const Stack = createStackNavigator()
```

**Correct: native stack**

```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
const Stack = createNativeStackNavigator()
```

**Correct: expo-router**

```tsx
import { Stack } from 'expo-router'
export default function Layout() { return <Stack /> }
```

**Reference:** [React Navigation Native Stack](https://reactnavigation.org/docs/native-stack-navigator)
