---
title: Use Pressable Instead of Touchable Components
impact: LOW
impactDescription: Modern API, more flexible
tags: ui, pressable, touchable
---

## Use Pressable Instead of Touchable Components

Never use TouchableOpacity or TouchableHighlight. Use Pressable from react-native or react-native-gesture-handler.

**Incorrect:**

```tsx
<TouchableOpacity onPress={onPress} activeOpacity={0.7}>
  <Text>Press me</Text>
</TouchableOpacity>
```

**Correct:**

```tsx
import { Pressable } from 'react-native'
<Pressable onPress={onPress}><Text>Press me</Text></Pressable>
```

Use react-native-gesture-handler's Pressable inside scrollable lists. For animated press states, use GestureDetector (see animation-gesture-detector-press.md).
