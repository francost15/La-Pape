---
title: Use Virtualized Lists for Any List
impact: HIGH
impactDescription: Reduced memory, faster mounts
tags: list, FlatList, FlashList, LegendList, performance
---

## Use a List Virtualizer for Any List

Use LegendList or FlashList instead of ScrollView with mapped children—even for short lists. Virtualizers only render visible items.

**Incorrect:**

```tsx
function Feed({ items }: { items: Item[] }) {
  return (
    <ScrollView>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </ScrollView>
  )
}
// 50 items = 50 components mounted
```

**Correct:**

```tsx
import { LegendList } from '@legendapp/list'

function Feed({ items }: { items: Item[] }) {
  return (
    <LegendList
      data={items}
      renderItem={({ item }) => <ItemCard item={item} />}
      keyExtractor={(item) => item.id}
      estimatedItemSize={80}
    />
  )
}
// Only ~10-15 visible items mounted
```

**Reference:** [LegendList](https://legendapp.com/open-source/legend-list), [FlashList](https://github.com/Shopify/flash-list)
