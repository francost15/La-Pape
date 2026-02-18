---
title: Import from Design System Folder
impact: LOW
impactDescription: Enables global changes and easy refactoring
tags: imports, design-system
---

## Import from Design System Folder

Re-export dependencies from a design system folder. App imports from there.

**Incorrect:**

```tsx
import { View, Text } from 'react-native'
import { Button } from '@ui/button'
```

**Correct:**

```tsx
import { View } from '@/components/view'
import { Text } from '@/components/text'
import { Button } from '@/components/button'
```

Start with re-exports; customize later without changing app code.
