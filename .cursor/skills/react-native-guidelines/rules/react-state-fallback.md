---
title: Use Fallback State Instead of initialState
impact: MEDIUM
impactDescription: Reactive fallbacks without syncing
tags: react, state, controlled
---

## Use Fallback State Instead of initialState

Use `undefined` as initial state and `??` to fall back to parent/server values. State = user intent only.

**Incorrect:**

```tsx
const [enabled, setEnabled] = useState(fallbackEnabled)
// If fallbackEnabled changes, state is stale
```

**Correct:**

```tsx
const [_enabled, setEnabled] = useState<boolean | undefined>(undefined)
const enabled = _enabled ?? fallbackEnabled
```

With server data: `const theme = _theme ?? data.theme` — shows server value until user overrides.
