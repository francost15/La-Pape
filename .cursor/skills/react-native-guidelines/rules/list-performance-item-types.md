---
title: Use Item Types for Heterogeneous Lists
impact: HIGH
impactDescription: Efficient recycling, less layout thrashing
tags: list, LegendList, FlashList, recycling
---

## Use Item Types for Heterogeneous Lists

When a list has different layouts (header, message, image), use `getItemType` for separate recycling pools.

**Incorrect:**

```tsx
function ListItem({ item }) {
  if (item.isHeader) return <HeaderItem />
  if (item.imageUrl) return <ImageItem />
  return <MessageItem />
}
```

**Correct:**

```tsx
type FeedItem = HeaderItem | MessageItem | ImageItem

<LegendList
  data={items}
  keyExtractor={(item) => item.id}
  getItemType={(item) => item.type}
  renderItem={({ item }) => {
    switch (item.type) {
      case 'header': return <SectionHeader title={item.title} />
      case 'message': return <MessageRow text={item.text} />
      case 'image': return <ImageRow url={item.url} />
    }
  }}
  recycleItems
/>
```
