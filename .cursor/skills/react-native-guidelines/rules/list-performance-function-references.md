---
title: Optimize List Performance with Stable Object References
impact: CRITICAL
impactDescription: Virtualization relies on reference stability
tags: list, performance, virtualization, zustand
---

## Optimize List Performance with Stable Object References

Don't map or filter data before passing to virtualized lists. New references cause full re-renders. Use context selectors within list items for dynamic data.

**Incorrect:**

```tsx
function DomainSearch() {
  const { keyword } = useKeywordZustandState()
  const { data: tlds } = useTlds()
  const domains = tlds.map((tld) => ({
    domain: `${keyword}.${tld.name}`,
    tld: tld.name,
    price: tld.price,
  }))
  return <LegendList data={domains} renderItem={...} />
}
// New objects on every keystroke → full list reparent
```

**Correct:**

```tsx
function DomainSearch() {
  const { data: tlds } = useTlds()
  return <LegendList data={tlds} renderItem={({ item }) => <DomainItem tld={item} />} />
}

function DomainItem({ tld }: { tld: Tld }) {
  const domain = useKeywordZustandState((s) => s.keyword + '.' + tld.name)
  return <Text>{domain}</Text>
}
```

Pass raw data; transform inside items with Zustand selectors. For sorting: `tlds.toSorted()` keeps inner references stable.
