---
title: Pass Primitives to List Items for Memoization
impact: HIGH
impactDescription: Enables effective memo() comparison
tags: list, performance, memo
---

## Pass Primitives to List Items for Memoization

Pass only primitive values (strings, numbers, booleans) when possible. Enables shallow comparison in memo().

**Incorrect:**

```tsx
const UserRow = memo(function UserRow({ user }: { user: User }) {
  return <Text>{user.name}</Text>
})
renderItem={({ item }) => <UserRow user={item} />}
// memo compares by reference
```

**Correct:**

```tsx
const UserRow = memo(function UserRow({ id, name, email }: Props) {
  return <Text>{name}</Text>
})
renderItem={({ item }) => (
  <UserRow id={item.id} name={item.name} email={item.email} />
)}
```
