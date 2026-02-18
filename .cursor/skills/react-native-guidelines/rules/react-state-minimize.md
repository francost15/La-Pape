---
title: Minimize State Variables and Derive Values
impact: MEDIUM
impactDescription: Fewer re-renders, less state drift
tags: react, state
---

## Minimize State Variables and Derive Values

Use fewest state variables. Derive values during render instead of storing in state.

**Incorrect:**

```tsx
const [total, setTotal] = useState(0)
const [itemCount, setItemCount] = useState(0)
useEffect(() => {
  setTotal(items.reduce((s, i) => s + i.price, 0))
  setItemCount(items.length)
}, [items])
```

**Correct:**

```tsx
const total = items.reduce((s, i) => s + i.price, 0)
const itemCount = items.length
```

**Reference:** [React: Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
