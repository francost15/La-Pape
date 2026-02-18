---
title: Use Compound Components Over Polymorphic Children
impact: MEDIUM
impactDescription: Flexible composition, clearer API
tags: design-system, components
---

## Use Compound Components Over Polymorphic Children

Don't accept string children for non-Text components. Use compound components: Button, ButtonText, ButtonIcon.

**Incorrect:**

```tsx
function Button({ children, icon }: { children: string | ReactNode }) {
  return <Pressable>{typeof children === 'string' ? <Text>{children}</Text> : children}</Pressable>
}
<Button icon={<Icon />}>Save</Button>
```

**Correct:**

```tsx
function Button({ children }) { return <Pressable>{children}</Pressable> }
function ButtonText({ children }) { return <Text>{children}</Text> }
function ButtonIcon({ children }) { return <>{children}</> }

<Button><ButtonIcon><SaveIcon /></ButtonIcon><ButtonText>Save</ButtonText></Button>
```
