---
name: react-native-guidelines
description: Comprehensive React Native best practices for rendering, lists, animation, scroll, navigation, state, and UI. Use when writing, maintaining, or refactoring React Native code; when implementing FlatList/FlashList/LegendList; when adding animations with Reanimated; when working with navigation, modals, or images.
---

# React Native Guidelines

Best practices for React Native applications, optimized for agents and LLMs. Prioritized by impact: CRITICAL (crashes) → HIGH (performance) → MEDIUM → LOW.

## Quick Reference by Impact

| Level | Use when |
|-------|----------|
| **CRITICAL** | Core rendering, list virtualization, monorepo native deps |
| **HIGH** | List performance, animation, scroll, navigation, state ground truth |
| **MEDIUM** | React state patterns, React Compiler, UI components, design system |
| **LOW** | Monorepo versions, imports, Intl, fonts |

---

## 1. Core Rendering (CRITICAL)

### 1.1 Never use `&&` with potentially falsy values

`{value && <Component />}` crashes if `value` is `""` or `0`—React Native tries to render them as text outside `<Text>`.

```tsx
// Incorrect: crashes if name="" or count=0
{name && <Text>{name}</Text>}
{count && <Text>{count} items</Text>}

// Correct: ternary
{name ? <Text>{name}</Text> : null}
{count ? <Text>{count} items</Text> : null}

// Correct: explicit boolean
{!!name && <Text>{name}</Text>}
```

### 1.2 Wrap strings in Text components

Strings must be inside `<Text>`. Direct children of `<View>` crash.

```tsx
// Incorrect
<View>Hello, {name}!</View>

// Correct
<View><Text>Hello, {name}!</Text></View>
```

---

## 2. List Performance (HIGH)

### Virtualize lists

Use LegendList or FlashList instead of `ScrollView` + `map`. Virtualizers render only visible items.

```tsx
import { LegendList } from '@legendapp/list'

<LegendList
  data={items}
  renderItem={({ item }) => <ItemCard item={item} />}
  keyExtractor={(item) => item.id}
  estimatedItemSize={80}
/>
```

### Stable references

Don't `map`/`filter` before passing to list—new references cause full re-renders. Pass raw data, transform inside items using selectors (e.g. Zustand).

### Avoid inline objects in renderItem

```tsx
// Incorrect: new object every render
renderItem={({ item }) => <UserRow user={{ id: item.id, name: item.name }} />}

// Correct: pass item or primitives
renderItem={({ item }) => <UserRow id={item.id} name={item.name} />}
```

### Hoist callbacks to list root

Create one callback instance, pass item ID to child; child calls handler with ID.

### Pass primitives for memoization

Primitives enable effective `memo()` comparison. Avoid passing whole objects when only a few fields are needed.

### Keep list items lightweight

No queries, no expensive computation, minimal Context. Prefer Zustand selectors. Pass pre-computed values as props.

### Compressed images in lists

Request thumbnails (e.g. `?w=200&h=200`). Use expo-image. Request 2x display size for retina.

### Heterogeneous lists: use getItemType

Different layouts (header, message, image) should use `getItemType` and separate components for efficient recycling.

---

## 3. Animation (HIGH)

### Animate transform/opacity, not layout

Avoid animating `width`, `height`, `top`, `left`, `margin`, `padding`. Use `transform` and `opacity` (GPU-accelerated).

```tsx
// Incorrect: height triggers layout every frame
height: withTiming(expanded ? 200 : 0)

// Correct: scaleY + opacity
transform: [{ scaleY: withTiming(expanded ? 1 : 0) }]
opacity: withTiming(expanded ? 1 : 0)
```

### GestureDetector for press animations

Use Gesture.Tap() with shared values instead of Pressable's onPressIn/onPressOut. Callbacks run on UI thread.

### Prefer useDerivedValue over useAnimatedReaction

For derivations, use `useDerivedValue`. Use `useAnimatedReaction` only for side effects.

---

## 4. Scroll (HIGH)

### Never track scroll in useState

Scroll events fire rapidly; useState causes render thrashing. Use Reanimated shared value for animations, or ref for non-reactive tracking.

```tsx
const scrollY = useSharedValue(0)
const onScroll = useAnimatedScrollHandler({
  onScroll: (e) => { scrollY.value = e.contentOffset.y }
})
<Animated.ScrollView onScroll={onScroll} />
```

---

## 5. Navigation (HIGH)

Use native navigators: `@react-navigation/native-stack`, `react-native-bottom-tabs`, or expo-router's native stack/tabs. Avoid JS-based `@react-navigation/stack` and `@react-navigation/bottom-tabs`.

---

## 6. React State (MEDIUM)

- **Functional setState**: Use `setState(prev => ...)` when next state depends on current.
- **Fallback over initialState**: Use `undefined` + `??` for reactive fallbacks from props/server.
- **Minimize state**: Derive values during render; don't store redundant state.

---

## 7. State Architecture (MEDIUM)

State = ground truth (e.g. `pressed`, `progress`). Derive visual values (scale, opacity) via interpolation.

---

## 8. React Compiler (MEDIUM)

- Destructure functions early (`const { push } = useRouter()`), don't dot into objects.
- Use `.get()`/`.set()` for Reanimated shared values, not `.value`.

---

## 9. User Interface (MEDIUM)

- **Images**: expo-image (caching, blurhash, progressive loading).
- **Galleries**: @nandorojo/galeria for lightbox.
- **Menus**: zeego for dropdown/context menus.
- **Modals**: Native `Modal` with `presentationStyle="formSheet"` over JS bottom sheets.
- **Pressable**: Use Pressable, not TouchableOpacity.
- **Safe area**: `contentInsetAdjustmentBehavior="automatic"` on root ScrollView.
- **contentInset**: For dynamic spacing (keyboard, toolbars); avoids layout recalculation.
- **Styling**: `gap`, `borderCurve: 'continuous'`, `boxShadow` string, `experimental_backgroundImage` for gradients.
- **Font hierarchy**: Use weight/color, not multiple font sizes.

---

## 10. Design System (MEDIUM)

Use compound components (Button, ButtonText, ButtonIcon) over polymorphic children.

---

## 11. Monorepo (LOW)

- Install native deps in the app directory for autolinking.
- Single dependency versions across packages (syncpack, overrides).

---

## 12. Third-Party / JS / Fonts (LOW)

- Import from design system folder for easy refactoring.
- Hoist `Intl.DateTimeFormat`/`Intl.NumberFormat` to module scope.
- Load fonts at build time with expo-font config plugin.

---

## Additional Resources

- Full rules with examples: [reference/full-guidelines.md](reference/full-guidelines.md)
- Individual rules: [rules/](rules/) (see _sections.md for index)
- Creating new rules: Copy [rules/_template.md](rules/_template.md) to `rules/area-description.md`

## References

- [React](https://react.dev) · [React Native](https://reactnative.dev) · [Reanimated](https://docs.swmansion.com/react-native-reanimated) · [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler) · [Expo](https://docs.expo.dev) · [LegendList](https://legendapp.com/open-source/legend-list) · [Galeria](https://github.com/nandorojo/galeria) · [Zeego](https://zeego.dev)
