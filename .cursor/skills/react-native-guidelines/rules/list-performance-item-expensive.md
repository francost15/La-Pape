---
title: Keep List Items Lightweight
impact: HIGH
impactDescription: Reduces render time during scroll
tags: list, performance, hooks, context
---

## Keep List Items Lightweight

List items should be inexpensive to render. No queries, minimal hooks, limit Context. Prefer Zustand selectors.

**Incorrect:**

```tsx
function ProductRow({ id }: { id: string }) {
  const { data } = useQuery(['product', id], fetchProduct)
  const theme = useContext(ThemeContext)
  const user = useContext(UserContext)
  const recs = useMemo(() => computeRecs(product), [product])
  return <View>...</View>
}
```

**Correct:**

```tsx
function ProductRow({ name, price, imageUrl }: Props) {
  return (
    <View>
      <Image source={{ uri: imageUrl }} />
      <Text>{name}</Text>
      <Text>{price}</Text>
    </View>
  )
}
// Parent fetches data; pass primitives
```
