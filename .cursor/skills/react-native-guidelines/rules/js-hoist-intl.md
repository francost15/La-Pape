---
title: Hoist Intl Formatter Creation
impact: LOW
impactDescription: Avoids expensive object recreation
tags: javascript, intl, performance
---

## Hoist Intl Formatter Creation

Don't create Intl.DateTimeFormat, Intl.NumberFormat inside render or loops. Hoist to module scope when locale/options are static.

**Incorrect:**

```tsx
function Price({ amount }) {
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  return <Text>{formatter.format(amount)}</Text>
}
```

**Correct:**

```tsx
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
function Price({ amount }) {
  return <Text>{currencyFormatter.format(amount)}</Text>
}
```

For dynamic locales: `useMemo(() => new Intl.DateTimeFormat(locale, {...}), [locale])`
