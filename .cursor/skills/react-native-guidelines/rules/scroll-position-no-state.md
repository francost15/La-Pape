---
title: Never Track Scroll Position in useState
impact: HIGH
impactDescription: Prevents render thrashing during scroll
tags: scroll, performance, reanimated
---

## Never Track Scroll Position in useState

Scroll events fire rapidly. useState causes render thrashing and dropped frames. Use Reanimated shared value for animations, or ref for non-reactive tracking.

**Incorrect:**

```tsx
const [scrollY, setScrollY] = useState(0)
const onScroll = (e) => setScrollY(e.nativeEvent.contentOffset.y)
return <ScrollView onScroll={onScroll} />
```

**Correct: Reanimated for animations**

```tsx
const scrollY = useSharedValue(0)
const onScroll = useAnimatedScrollHandler({
  onScroll: (e) => { scrollY.value = e.contentOffset.y }
})
return <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} />
```

**Correct: ref for non-reactive**

```tsx
const scrollY = useRef(0)
const onScroll = (e) => { scrollY.current = e.nativeEvent.contentOffset.y }
return <ScrollView onScroll={onScroll} />
```
