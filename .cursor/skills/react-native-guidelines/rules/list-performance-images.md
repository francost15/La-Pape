---
title: Use Compressed Images in Lists
impact: HIGH
impactDescription: Faster load times, less memory
tags: list, images, performance
---

## Use Compressed Images in Lists

Request thumbnails from server or CDN with resize params. Use expo-image.

**Incorrect:**

```tsx
<Image source={{ uri: product.imageUrl }} style={{ width: 100, height: 100 }} />
// 4000x3000 loaded for 100x100 thumbnail
```

**Correct:**

```tsx
const thumbnailUrl = `${product.imageUrl}?w=200&h=200&fit=cover`
<Image source={{ uri: thumbnailUrl }} style={{ width: 100, height: 100 }} contentFit="cover" />
```

Request 2x display size for retina. Use expo-image for caching and placeholders.
