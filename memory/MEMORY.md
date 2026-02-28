# La Pape — Claude Memory

## Stack
- React Native + Expo (managed workflow)
- TypeScript estricto
- Tailwind via NativeWind (clases en `className`)
- Zustand para estado global
- Firebase Firestore (real-time listeners)
- React Native Reanimated para animaciones
- expo-image para imágenes (mejor caché que `<Image>` de RN)
- expo-haptics para feedback táctil (Platform.OS !== "web" antes de llamar)

## Estructura clave

```
app/(tabs)/             ← pantallas principales
components/resumen/     ← componentes del módulo resumen
  shared/               ← SectionCard, EmptyState (reutilizables)
hooks/                  ← custom hooks (use-usuarios-map, use-productos-screen...)
lib/utils/format.ts     ← formatCurrency, formatDate, pluralize (NO duplicar inline)
store/                  ← stores Zustand (resumen, filtros, session, productos, layout)
.claude/context/        ← contexto por módulo para Claude
```

## Convenciones

- `formatCurrency` y `formatDate` siempre desde `@/lib/utils/format`
- Cards de sección: usar `SectionCard` de `@/components/resumen/shared/SectionCard`
- Estados vacíos: usar `EmptyState` de `@/components/resumen/shared/EmptyState`
- Listas de items costosos: envolver con `React.memo` + pasar props primitivos
- Layout responsive: `isMobile` viene de `useLayoutStore((s) => s.isMobile)`
- Animaciones: siempre con Reanimated (`useSharedValue` + `withTiming`), no `Animated` de RN

## Módulos documentados

- [Resumen](.claude/context/resumen-module.md) — arquitectura, componentes, stores, UX
