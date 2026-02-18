---
title: Measuring View Dimensions
impact: MEDIUM
impactDescription: Synchronous measurement, avoid unnecessary re-renders
tags: ui, layout, onLayout
---

## Measuring View Dimensions

Use useLayoutEffect (sync) + onLayout (updates). For non-primitive state, use dispatch updater to compare and skip re-renders.

```tsx
const ref = useRef<View>(null)
const [size, setSize] = useState<Size | undefined>(undefined)

useLayoutEffect(() => {
  const rect = ref.current?.getBoundingClientRect()
  if (rect) setSize({ width: rect.width, height: rect.height })
}, [])

const onLayout = (e: LayoutChangeEvent) => {
  const { width, height } = e.nativeEvent.layout
  setSize((prev) => {
    if (prev?.width === width && prev?.height === height) return prev
    return { width, height }
  })
}
return <View ref={ref} onLayout={onLayout}>...</View>
```
