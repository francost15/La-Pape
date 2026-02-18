---
title: Use Galeria for Image Galleries and Lightbox
impact: MEDIUM
impactDescription: Native shared element transitions
tags: ui, gallery, images
---

## Use Galeria for Image Galleries and Lightbox

Use @nandorojo/galeria for lightbox with pinch-to-zoom, double-tap zoom, pan-to-close.

**Incorrect: custom modal**

```tsx
<Modal visible={!!selected}>
  <Image source={{ uri: selected }} />
</Modal>
```

**Correct:**

```tsx
import { Galeria } from '@nandorojo/galeria'
<Galeria urls={urls}>
  {urls.map((url, index) => (
    <Galeria.Image index={index} key={url}>
      <Image source={{ uri: url }} style={styles.thumbnail} />
    </Galeria.Image>
  ))}
</Galeria>
```

**Reference:** [Galeria](https://github.com/nandorojo/galeria)
