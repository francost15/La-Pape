---
title: Hoist Callbacks to List Root
impact: HIGH
impactDescription: Fewer re-renders and faster lists
tags: list, performance, callbacks
---

## Hoist Callbacks to the Root of Lists

Create a single callback instance at the root; items call it with a unique identifier.

**Incorrect:**

```tsx
renderItem={({ item }) => {
  const onPress = () => handlePress(item.id)
  return <Item key={item.id} item={item} onPress={onPress} />
}}
```

**Correct:**

```tsx
const onItemPress = useCallback((id: string) => handlePress(id), [handlePress])
renderItem={({ item }) => (
  <Item key={item.id} item={item} id={item.id} onPress={onItemPress} />
)}
// In Item: <Pressable onPress={() => onPress(id)}> — handler is stable, id is primitive
```
