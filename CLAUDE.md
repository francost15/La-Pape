# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
expo start          # Start dev server (iOS/Android/Web)
expo start --web    # Web only
expo run:android    # Build and run on Android
expo run:ios        # Build and run on iOS
expo lint           # Run ESLint
```

There are no tests configured in this project.

## Architecture Overview

**La Pape** is a multi-tenant point-of-sale system for Chilean businesses. It supports multiple users, branches (sucursales), and business entities (negocios).

### Tech Stack

- **Routing**: Expo Router v6 (file-based, typed routes enabled)
- **Styling**: NativeWind v5 (Tailwind via `className` prop) — mobile-first, dark mode via `dark:` variants
- **State**: Zustand v5 — one store per domain, no Redux
- **Backend**: Firebase Firestore (real-time listeners) + Firebase Auth (email/password + Google OAuth)
- **Forms**: React Hook Form + Zod schemas
- **Animations**: React Native Reanimated — always use `useSharedValue`/`withTiming`, never `Animated` from RN core
- **Images**: `expo-image` (better caching) — not React Native's built-in `Image`
- **Icons**: SF Symbols on iOS, MaterialIcons on Android/web via `components/ui/icon-symbol.tsx` — add new mappings to the `MAPPING` object there when adding SF Symbols

### Route Structure

```
app/
├── (auth)/index.tsx          ← Login screen
├── index.tsx                 ← Splash/redirect
├── configuracion.tsx         ← Settings
└── (tabs)/
    ├── ventas/               ← POS checkout
    ├── productos/            ← Inventory (list → detail → edit/create)
    ├── history/              ← Sales history
    └── resumen/              ← Analytics dashboard
```

### Zustand Stores

| Store | Propósito |
|-------|-----------|
| `useSessionStore` | Auth session: `userId`, `negocioId`, `sucursalId`, `ready` flag |
| `useResumenStore` | Real-time sales metrics, `detallesMap`, rankings |
| `useFiltrosStore` | Date range / period filter shared across screens |
| `useProductosStore` | Product catalog, categories, `currentProduct` |
| `useVentasStore` | Shopping cart items and totals |
| `useLayoutStore` | `isMobile` breakpoint flag |

`useSessionStore.hydrate(user)` runs on `onAuthStateChanged` and populates `negocioId`/`sucursalId` by querying Firestore. Wait for `ready === true` before rendering authenticated screens.

### Firebase Data Model

Collections: `usuarios`, `negocios`, `sucursales`, `usuarios-negocios` (many-to-many with roles), `productos`, `categorias`, `ventas`, `ventas-detalle`, `ventas-pagos`, `clientes`, `inventario-movimientos`.

All services live in `lib/services/<domain>/`. Firebase is initialized in `lib/firebase.ts`; a secondary app in `lib/firebase-secondary.ts` is used for admin user-creation flows (so the current session isn't signed out).

### Resumen Module

The dashboard follows an **orchestrator + specialized components** pattern. `app/(tabs)/resumen/index.tsx` only coordinates stores and passes data down — no business logic inline.

```
components/resumen/
├── shared/SectionCard.tsx        ← card wrapper (bg, border, shadow) — use instead of repeating bg-white rounded-xl...
├── shared/EmptyState.tsx         ← empty state with icon
├── KpiGrid.tsx                   ← 3 KPI cards with staggered animation
├── CategoryBreakdown.tsx         ← donut chart + progress bar legend
├── VentasPorUsuario.tsx          ← vendor rows with participation bar
├── TopProductsList.tsx           ← top products flat list (RankingRow)
└── ProductosBajoStockList.tsx    ← low-stock flat list (StockRow)
```

**Do not use `CardProducts` inside resumen sections** — use the flat `RankingRow`/`StockRow` patterns already in those files.

## Key Conventions

### Formatting utilities
Always import from `@/lib/utils/format` — never define inline:
```ts
import { formatCurrency, formatDate, pluralize } from "@/lib/utils/format";
```
Currency is formatted for Chilean locale (`es-CL`): `$12.345,60`.

### Responsive layout
```ts
const { width } = useWindowDimensions();
const isDesktop = width >= 768;
// or from store:
const isMobile = useLayoutStore((s) => s.isMobile);
```

### Haptics
Always guard with platform check:
```ts
if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

### TypeScript
- Prefer `interface` over `type` for props
- Avoid `any` — use `iconName as any` only for SF Symbol `name` prop (known limitation)
- No enums — use `const` objects or string unions

### Comments
Explain **why**, not what. E.g.:
```ts
// Barra de participación: permite comparar el peso de cada vendedor de un vistazo
// sin necesidad de leer los números exactos
```

### Component size
Keep components under ~300 lines. Extract sub-components when a single component grows beyond that.

### Performance
- Wrap expensive list items in `React.memo`
- Use `useMemo`/`useCallback` for derived data and handlers passed to lists
- Pass primitive props to memoized components where possible

## Module Context Files

Detailed architecture notes for specific modules are in `.claude/context/`:
- `.claude/context/resumen-module.md` — resumen module architecture, UX rules, store selectors
