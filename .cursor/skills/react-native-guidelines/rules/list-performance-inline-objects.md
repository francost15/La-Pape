---
title: Avoid Inline Objects in renderItem
impact: HIGH
impactDescription: Prevents unnecessary re-renders of memoized list items
tags: list, performance, memoization
---

## Avoid Inline Objects in renderItem

Don't create new objects inside renderItem. Pass primitives or the item directly.

**Incorrect:**

```tsx
renderItem={({ item }) => (
  <UserRow user={{ id: item.id, name: item.name, avatar: item.avatar }} />
)}
renderItem={({ item }) => (
  <UserRow style={{ backgroundColor: item.isActive ? 'green' : 'gray' }} />
)}
```

**Correct:**

```tsx
renderItem={({ item }) => <UserRow user={item} />}
// or primitives:
renderItem={({ item }) => (
  <UserRow id={item.id} name={item.name} isActive={item.isActive} />
)}
// Derive style inside memoized child:
const UserRow = memo(function UserRow({ id, name, isActive }) {
  const backgroundColor = isActive ? 'green' : 'gray'
  return <View style={[styles.row, { backgroundColor }]} />
})
```
