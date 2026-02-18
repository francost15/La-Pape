# React Native Guidelines — Full Reference

Version 1.0.0 | For agents and LLMs maintaining/generating React Native code.

## Table of Contents

1. Core Rendering (CRITICAL)
2. List Performance (HIGH)
3. Animation (HIGH)
4. Scroll Performance (HIGH)
5. Navigation (HIGH)
6. React State (MEDIUM)
7. State Architecture (MEDIUM)
8. React Compiler (MEDIUM)
9. User Interface (MEDIUM)
10. Design System (MEDIUM)
11. Monorepo (LOW)
12. Third-Party / JavaScript / Fonts (LOW)

---

## 1. Core Rendering (CRITICAL)

### 1.1 Never Use && with Potentially Falsy Values

`{value && <Component />}` crashes if value is `""` or `0`. Use ternary, `!!value`, or early return.

**Lint:** `react/jsx-no-leaked-render` from eslint-plugin-react.

### 1.2 Wrap Strings in Text Components

Strings must be inside `<Text>`. Direct children of `<View>` cause runtime crash.

---

## 2. List Performance (HIGH)

- **Virtualize**: LegendList or FlashList, not ScrollView + map
- **Stable references**: Don't map/filter before passing; transform inside items with Zustand selectors
- **No inline objects** in renderItem
- **Hoist callbacks** to list root
- **Pass primitives** for memo() effectiveness
- **Lightweight items**: No queries, minimal hooks, Zustand over Context
- **Compressed images**: Thumbnails (2x display), expo-image
- **Heterogeneous lists**: getItemType for separate recycling pools

---

## 3. Animation (HIGH)

- **Transform/opacity only**: Not width, height, margin, padding
- **GestureDetector** for press animations (UI thread worklets)
- **useDerivedValue** over useAnimatedReaction for derivations

---

## 4. Scroll (HIGH)

- **Never useState** for scroll position; use Reanimated shared value or ref

---

## 5. Navigation (HIGH)

- Native stack: `@react-navigation/native-stack` or expo-router
- Native tabs: `react-native-bottom-tabs` or expo-router native tabs
- Avoid JS-based stack and bottom-tabs

---

## 6. React State (MEDIUM)

- **Functional setState**: `setState(prev => ...)` when next depends on current
- **Fallback state**: `undefined` + `??` for reactive fallbacks
- **Minimize state**: Derive values during render

---

## 7. State Architecture (MEDIUM)

- State = ground truth (pressed, progress). Derive visuals via interpolation.

---

## 8. React Compiler (MEDIUM)

- Destructure functions early (`const { push } = useRouter()`)
- Use `.get()`/`.set()` for Reanimated shared values

---

## 9. User Interface (MEDIUM)

| Rule | Use |
|------|-----|
| Images | expo-image |
| Galleries | @nandorojo/galeria |
| Menus | zeego |
| Modals | Native Modal with formSheet |
| Touchables | Pressable |
| Safe area | contentInsetAdjustmentBehavior="automatic" |
| Dynamic spacing | contentInset |
| Styling | gap, borderCurve, boxShadow string, experimental_backgroundImage |
| Font hierarchy | weight/color, not multiple sizes |
| Measure views | useLayoutEffect + onLayout, dispatch updater for size |

---

## 10. Design System (MEDIUM)

Compound components (Button, ButtonText, ButtonIcon) over polymorphic children.

---

## 11. Monorepo (LOW)

- Native deps in app directory
- Single versions (syncpack, overrides)

---

## 12. Third-Party / JS / Fonts (LOW)

- Import from design system folder
- Hoist Intl formatters to module scope
- Load fonts at build time (expo-font config plugin)

---

## References

- [React](https://react.dev) · [React Native](https://reactnative.dev) · [Reanimated](https://docs.swmansion.com/react-native-reanimated) · [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler) · [Expo](https://docs.expo.dev) · [LegendList](https://legendapp.com/open-source/legend-list) · [Galeria](https://github.com/nandorojo/galeria) · [Zeego](https://zeego.dev)
