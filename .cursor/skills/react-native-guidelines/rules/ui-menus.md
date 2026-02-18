---
title: Use Native Menus for Dropdowns and Context Menus
impact: HIGH
impactDescription: Native accessibility, platform-consistent UX
tags: ui, menus, zeego
---

## Use Native Menus for Dropdowns and Context Menus

Use zeego for cross-platform native menus. Avoid custom JS implementations.

**Incorrect: custom JS menu**

```tsx
{open && <View style={{ position: 'absolute' }}>...</View>}
```

**Correct:**

```tsx
import * as DropdownMenu from 'zeego/dropdown-menu'
<DropdownMenu.Root>
  <DropdownMenu.Trigger><Pressable><Text>Open</Text></Pressable></DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item key="edit" onSelect={...}>
      <DropdownMenu.ItemTitle>Edit</DropdownMenu.ItemTitle>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

Context menu: `zeego/context-menu` for long-press.

**Reference:** [Zeego](https://zeego.dev/components/dropdown-menu)
