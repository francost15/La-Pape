---
title: Never Use && with Potentially Falsy Values
impact: CRITICAL
impactDescription: Prevents production crash
tags: rendering, conditional, crash
---

## Never Use && with Potentially Falsy Values

Never use `{value && <Component />}` when value could be an empty string or `0`. These are falsy but JSX-renderable—React Native will try to render them as text outside a `<Text>` component, causing a hard crash.

**Incorrect:**

```tsx
function Profile({ name, count }: { name: string; count: number }) {
  return (
    <View>
      {name && <Text>{name}</Text>}
      {count && <Text>{count} items</Text>}
    </View>
  )
}
// If name="" or count=0, renders the falsy value → crash
```

**Correct: ternary with null**

```tsx
function Profile({ name, count }: { name: string; count: number }) {
  return (
    <View>
      {name ? <Text>{name}</Text> : null}
      {count ? <Text>{count} items</Text> : null}
    </View>
  )
}
```

**Correct: explicit boolean coercion**

```tsx
{!!name && <Text>{name}</Text>}
{!!count && <Text>{count} items</Text>}
```

**Best: early return**

```tsx
function Profile({ name, count }: { name: string; count: number }) {
  if (!name) return null
  return (
    <View>
      <Text>{name}</Text>
      {count > 0 ? <Text>{count} items</Text> : null}
    </View>
  )
}
```

**Lint:** Enable `react/jsx-no-leaked-render` from eslint-plugin-react.
