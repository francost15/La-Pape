---
title: Use expo-image for Optimized Images
impact: HIGH
impactDescription: Memory efficiency, caching, placeholders
tags: ui, images, expo
---

## Use expo-image for Optimized Images

Use expo-image instead of React Native's Image. Caching, blurhash, progressive loading.

**Incorrect:**

```tsx
import { Image } from 'react-native'
<Image source={{ uri: url }} style={styles.avatar} />
```

**Correct:**

```tsx
import { Image } from 'expo-image'
<Image source={{ uri: url }} placeholder={{ blurhash: '...' }} contentFit="cover" transition={200} />
```

Props: `placeholder`, `contentFit`, `transition`, `priority`, `cachePolicy`, `recyclingKey`.

**Reference:** [expo-image](https://docs.expo.dev/versions/latest/sdk/image/)
