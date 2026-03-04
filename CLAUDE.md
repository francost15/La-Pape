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
- **Animations**: React Native Reanimated v4 — always use `useSharedValue`/`withTiming`, never `Animated` from RN core
- **Images**: `expo-image` (better caching) — not React Native's built-in `Image`
- **Icons**: SF Symbols on iOS, MaterialIcons on Android/web via `components/ui/icon-symbol.tsx` — add new mappings to the `MAPPING` object there when adding SF Symbols
- **PDF**: `expo-print` + `expo-sharing` for receipt generation (`lib/pdf/`)
- **QR**: `expo-camera` + `react-native-qrcode-svg` for scanning barcodes

### Route Structure

```
app/
├── _layout.tsx               ← Root layout: ThemeProvider, session listener, global overlays
├── index.tsx                 ← Splash/redirect (checks auth, routes accordingly)
├── (auth)/index.tsx          ← Login screen (email/password + Google OAuth)
├── configuracion.tsx         ← Settings (profile + team management tabs)
└── (tabs)/
    ├── _layout.tsx           ← Tab layout: auth guard, DynamicIslandTabBar, Navbar
    ├── ventas/               ← POS checkout (cart + product list)
    ├── productos/            ← Inventory (list → detail → edit/create)
    │   ├── index.tsx
    │   ├── create/index.tsx
    │   └── producto/[id]/
    │       ├── index.tsx     ← Product detail
    │       └── edit/index.tsx
    ├── history/              ← Sales history with refund support
    └── resumen/              ← Analytics dashboard (KPIs, charts, rankings)
```

**Global overlays** mounted in `app/_layout.tsx` (always on top):
- `AddProductsSheet` — bottom sheet for adding products to cart (mobile only)
- `VentaExitosaOverlay` — success modal after completing a sale
- `NativeToaster` — toast notifications

### Zustand Stores

| Store | File | Propósito |
|-------|------|-----------|
| `useSessionStore` | `store/session-store.ts` | Auth: `userId`, `userEmail`, `displayName`, `photoURL`, `negocioId`, `sucursalId`, `ready` |
| `useResumenStore` | `store/resumen-store.ts` | Real-time ventas listener + `detallesMap` + pure selectors |
| `useFiltrosStore` | `store/filtros-store.ts` | Date period filter (`semana`/`mes`/`año`/`personalizado`) |
| `useProductosStore` | `store/productos-store.ts` | Product catalog, categories, `currentProduct` |
| `useVentasStore` | `store/ventas-store.ts` | Shopping cart: `items`, `addItem`, `removeItem`, `getTotal` |
| `useLayoutStore` | `store/layout-store.ts` | `isMobile` breakpoint (< 768px) |
| `useCheckoutStore` | `store/checkout-store.ts` | Checkout flow: `confirmVisible`, `processing`, `successVenta` |
| `useEquipoStore` | `store/equipo-store.ts` | Team members list + role management |
| `useToastStore` | `store/toast-store.ts` | Toast queue (max 5, auto-dismiss after 3s) |
| `useProductSearchStore` | `store/product-search-store.ts` | Search state per context (`productos` \| `ventas`) |
| `useVentasUIStore` | `store/ventas-ui-store.ts` | Sheet/modal UI state for ventas screen |

**Session init flow**: `initSessionListener()` (called once in `app/_layout.tsx`) → `onAuthStateChanged` → `hydrate(user)` → queries Firestore for `negocioId`/`sucursalId` → sets `ready: true`. Always wait for `ready === true` before rendering authenticated content.

### Firebase Data Model

Firestore collections:

| Collection | Purpose |
|------------|---------|
| `usuarios` | User profiles (nombre, email, rol, activo) |
| `negocios` | Business entities |
| `sucursales` | Branches per negocio |
| `usuarios-negocios` | Many-to-many: user ↔ negocio with `activo` flag |
| `productos` | Product catalog (negocio-scoped, `activo: true` = visible) |
| `categorias` | Product categories (negocio-scoped) |
| `ventas` | Sale headers (estado: PENDIENTE/PAGADA/CANCELADA/REEMBOLSO/EN_PROCESO) |
| `ventas_detalle` | Line items per venta |
| `ventas_pagos` | Payment records per venta |
| `clientes` | Customer records (optional FK on ventas) |
| `inventario_movimientos` | Stock movements: tipo ENTRADA/SALIDA |

**Firestore collection names in code**: `ventas_detalle` and `inventario_movimientos` use underscores (not hyphens).

All services live in `lib/services/<domain>/`. Firebase is initialized in `lib/firebase.ts`; a secondary app (`lib/firebase-secondary.ts`) is used for admin user-creation flows so the current session isn't signed out.

### Key Service Patterns

**Real-time listener** (ventas):
```ts
// onVentasByNegocio returns an Unsubscribe — always call it on cleanup
const unsub = onVentasByNegocio(negocioId, callback, onError);
return () => unsub();
```

**Atomic transaction** (complete-venta):
- `completeVentaFlow` uses `runTransaction` to atomically: create venta + detalles + pago + decrement stock + log inventory movement
- If stock < requested → throws before writing anything
- Lives in `lib/services/ventas/complete-venta.ts`

**Refund flow** (`lib/services/ventas/refund-venta.ts`):
- `refundVentaFlow` → sets `estado: 'REEMBOLSO'`, restores stock, logs ENTRADA movements

**Soft delete for opcional fields** (`updateProduct`):
- Empty string for `imagen`/`descripcion`/`marca` → `deleteField()` in Firestore
- `null` values → `deleteField()`

### TypeScript Interfaces

All domain types live in `interface/<domain>/index.ts` and re-exported from `interface/index.ts`:

```ts
import { Product, Venta, Categoria, Usuario, UsuarioNegocio } from '@/interface';
```

Key types:
- `UserRole` = `'ADMIN' | 'VENDEDOR' | 'CAJERO'`
- `VentaEstado` = `'PENDIENTE' | 'PAGADA' | 'CANCELADA' | 'REEMBOLSO' | 'EN_PROCESO'`
- `TipoVenta` = `'CONTADO' | 'CREDITO'`
- `Product.id` = UUID used as barcode
- `CardProductsProps.variant` = `'default' | 'ranking' | 'stock'`

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

**Pure selectors** exported from `store/resumen-store.ts` (testable, no hooks):
- `selectMetricas(ventasFiltradas, detallesMap, products)` → KPI numbers
- `selectProductosRanking(...)` → `{ top: ProductoRanking[], bottom: ProductoRanking[] }`
- `selectCategorias(...)` → `CategoriaVenta[]`
- `selectProductosBajoStock(products)` → up to 8 products below `stock_minimo`
- `selectVentasPorUsuario(...)` → vendors sorted by total

**Period filter** (`useFiltrosStore`): `filterVentasByPeriodo(ventas, periodo, rango)` handles the date math — never inline date filtering in components.

### Ventas (POS) Module

**Desktop layout** (≥768px): `SidebarProducts` on the left (product browser) + `CartPanel` on the right.
**Mobile layout** (<768px): `CartPanel` fills screen; `FooterProducts` bar at bottom opens `AddProductsSheet` (bottom sheet overlay, not Modal).

**AddProductsSheet** is mounted as an overlay in `_layout.tsx` so toast notifications appear above it. Uses `Animated.Value` (RN core) for the drag-dismiss gesture — this is the one exception to the Reanimated rule, because `PanResponder` doesn't work with `useSharedValue`.

**QR scanning** (`QrScannerSheet`): native only (`expo-camera`), looks up product by ID (product ID = barcode), adds to cart if found.

**Cart flow**:
1. User adds items → `useVentasStore`
2. "Completar venta" → `useCheckoutStore.openConfirm()` → `ConfirmAlert`
3. On confirm → `completeVentaFlow` → success → `setSuccessVenta` → `VentaExitosaOverlay`
4. `VentaExitosaOverlay` shows `VentaExitosaModal` with receipt download / share options

### Products Module

`useProductosScreen` hook loads products+categories on mount via `onAuthStateChanged`. It exposes `refresh` and `retry`.

Product search uses `useProductSearch(contextId)` with `contextId: 'productos' | 'ventas'` — each screen maintains independent search state. Search matches against `nombre`, `marca`, and category name.

**Product form** (`FormProductos` + subcomponents in `components/forms/products/`):
- `CampoNombre`, `CampoCategoria`, `CampoPrecio`, `CampoCostos`, `CampoDescripcion`, `CampoMarca`, `CampoImagen`
- Validation schema: `lib/validations/product-schema.ts` (Zod) — `precio_mayoreo <= precio_venta` cross-field validation

### Configuracion Screen

Two tabs rendered inline (not via routing):
- `ConfigTabPerfil` — user profile editing
- `ConfigTabEquipo` — team management (list members, change roles, invite new users)

`useEquipoStore` manages team state. Role changes call `updateUsuario` on the usuario doc.

## Key Conventions

### Formatting utilities
Always import from `@/lib/utils/format` — never define inline:
```ts
import { formatCurrency, formatDate, formatTime, formatDateHeader, pluralize } from "@/lib/utils/format";
```
- `formatCurrency(1234.5)` → `$1.234,50` (Chilean locale `es-CL`)
- `formatDate(date)` → `"3 de marzo de 2026"` (Spanish long format)
- `formatTime(date)` → `"14:35"` (24h, `es-CL`)
- `formatDateHeader(date)` → `"Hoy"` / `"Ayer"` / `"3 de marzo"` (for list headers)
- `pluralize(count, "producto", "productos")` → handles singular/plural

### Typography
Use `AppFonts` from `@/constants/typography` for `style={{ fontFamily: ... }}`:
```ts
import { AppFonts } from "@/constants/typography";
// AppFonts.display   → heavy condensed (headings with personality, totals)
// AppFonts.heading   → demibold (section titles, labels)
// AppFonts.body      → regular (body text)
// AppFonts.bodyStrong → medium (buttons, important labels)
```
Platform-specific: iOS uses Avenir, Android uses system sans, web uses Bebas Neue/Nunito Sans.

### Notifications / Toasts
Use `notify` from `@/lib/notify` — never push to `useToastStore` directly:
```ts
import { notify } from "@/lib/notify";
notify.success({ title: "Venta completada", description: "Total: $1.234" });
notify.error({ title: "Error al guardar" });
notify.warning({ title: "Stock bajo" });
notify.info({ title: "Carrito vaciado" });
```

### Haptics
Use the `useHaptic()` hook — it handles the platform guard internally:
```ts
import { useHaptic } from "@/hooks/use-haptic";
const haptic = useHaptic();
// Call haptic() on press handlers that need feedback
```
For direct calls (outside components): guard with `if (Platform.OS !== "web")`.

### Responsive layout
```ts
// From store (synced to window resize via LayoutSync component):
const isMobile = useLayoutStore((s) => s.isMobile);

// Or compute locally for critical layout decisions:
const { width } = useWindowDimensions();
const isDesktop = width >= 768;  // DESKTOP_MIN_WIDTH = 768
```
`LayoutSync` in `app/_layout.tsx` keeps `useLayoutStore` updated automatically.

### Screen animation
Wrap every tab screen content in `AnimatedScreen` for fade+slide-up on focus:
```tsx
import AnimatedScreen from "@/components/ui/AnimatedScreen";
return <AnimatedScreen className="flex-1 bg-gray-100 dark:bg-neutral-900">...</AnimatedScreen>;
```

### SectionCard
Use `SectionCard` from `components/resumen/shared/SectionCard.tsx` for any card container in resumen. Pass `title` for automatic heading styling:
```tsx
<SectionCard title="Top Productos" className="flex-1 min-w-0">
  {/* content */}
</SectionCard>
```

### TypeScript
- Prefer `interface` over `type` for props and object shapes
- Avoid `any` — use `iconName as any` only for SF Symbol `name` prop (known limitation)
- No enums — use `const` objects or string unions (e.g., `UserRole = 'ADMIN' | 'VENDEDOR' | 'CAJERO'`)
- Input types follow the pattern: `CreateXInput`, `UpdateXInput` (all fields optional on Update)

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
- Memoize `ListHeaderComponent` and `ListEmptyComponent` with `useMemo` in list screens
- `keyExtractor` should be `useCallback`-wrapped

### Shadow / elevation
- **Web**: use `boxShadow` style property (not CSS `className`)
- **iOS**: use `shadow*` props
- **Android**: use `elevation`
- Pattern: `Platform.select({ ios: { shadowColor, shadowOffset, ... }, android: { elevation }, web: { boxShadow } })`

### Dark mode
- Always pair every light color class with a `dark:` variant
- Use `useColorScheme()` hook (from `@/hooks/use-color-scheme`) for imperative dark mode checks
- For modals/overlays that can't use NativeWind easily, use `useColorScheme()` + `StyleSheet`

## File Organization

```
app/                      ← Expo Router screens and layouts
assets/images/            ← Static image assets (PNG, WebP)
components/
├── auth/                 ← Login form component
├── badges/               ← BadgeCategoryProducts
├── cards/                ← card-products.tsx (generic product card)
├── forms/
│   ├── FormProductos.tsx ← Product form orchestrator
│   └── products/         ← Individual form field components
├── history/              ← VentaCard
├── products/             ← ProductImageDisplay, ProductPriceCard, ProductStockCard
├── resumen/              ← Dashboard components (see Resumen Module section)
├── search/               ← PeriodFilter, PeriodBadges, SearchProducts, CustomRangeContent
├── settings/             ← ConfigTabEquipo, ConfigTabPerfil
├── ui/                   ← Generic UI primitives
│   ├── AnimatedScreen.tsx
│   ├── CircleIconButton.tsx
│   ├── ConfirmAlert.tsx
│   ├── icon-symbol.tsx   ← Cross-platform icon (SF Symbols / MaterialIcons)
│   └── icon-symbol.ios.tsx
└── ventas/               ← POS checkout components
constants/
├── theme.ts              ← Colors, Fonts (platform-specific)
└── typography.ts         ← AppFonts (Avenir/Nunito/Bebas hierarchy)
hooks/
├── use-color-scheme.ts   ← Dark mode hook (platform variants)
├── use-haptic.ts         ← Haptic feedback (web-safe)
├── use-product-search.ts ← Filtered product list by context
├── use-productos-screen.ts ← Products data loading hook
└── use-usuarios-map.ts   ← Resolves user display names/photos
interface/                ← TypeScript interfaces per domain
lib/
├── auth.ts               ← Email/password auth helpers
├── authWithGoogle.ts     ← Google OAuth flow
├── firebase.ts           ← Firebase app + db + auth exports
├── firebase-secondary.ts ← Secondary app for admin user creation
├── notify.ts             ← notify.success/error/warning/info
├── index.ts              ← Re-exports for common lib imports
├── pdf/                  ← Receipt generation (generate-recibo, recibo-template, logo)
├── services/             ← Firestore CRUD + listeners per domain
│   ├── categorias/
│   ├── inventario-movimientos/
│   ├── productos/
│   ├── sucursales/
│   ├── usuarios/
│   ├── usuarios-negocios/
│   └── ventas/
│       ├── index.ts           ← createVenta, updateVenta, onVentasByNegocio
│       ├── complete-venta.ts  ← completeVentaFlow (atomic transaction)
│       └── refund-venta.ts    ← refundVentaFlow (atomic transaction)
├── utils/
│   ├── format.ts         ← formatCurrency, formatDate, formatTime, etc.
│   └── ventas-helpers.ts ← Sale computation helpers
└── validations/
    ├── auth-schema.ts    ← Zod schema for login form
    └── product-schema.ts ← Zod schema for product creation/edit
seeders/seed.ts           ← One-time Firestore seeding script
store/                    ← Zustand stores (see Stores table above)
```

## Module Context Files

Detailed architecture notes for specific modules are in `.claude/context/`:
- `.claude/context/resumen-module.md` — resumen module architecture, UX rules, store selectors

## Common Patterns

### Adding a new screen
1. Create file under `app/(tabs)/new-screen/index.tsx`
2. Add `<Tabs.Screen>` entry in `app/(tabs)/_layout.tsx`
3. Add icon mapping in `components/ui/icon-symbol.tsx` if using a new SF Symbol
4. Wrap content in `<AnimatedScreen>`

### Adding a new Zustand store
```ts
// store/my-store.ts
import { create } from 'zustand';

interface MyStore {
  // state...
  // actions...
}

const initialState = { /* ... */ };

export const useMyStore = create<MyStore>((set, get) => ({
  ...initialState,
  // actions...
  reset: () => set(initialState),
}));
```

### Calling Firestore from a service
```ts
// All Timestamp conversions happen in the service layer:
fecha: data.fecha?.toDate(),  // Firestore Timestamp → JS Date
createdAt: data.createdAt?.toDate(),
```

### Pattern: screen with async data
```ts
// Use onAuthStateChanged inside a custom hook (not the screen)
// Screen only calls the hook and renders
const { data, loading, error, retry } = useMyDataHook();
if (error) return <ErrorView onRetry={retry} />;
if (loading) return <ActivityIndicator />;
return <ScreenContent data={data} />;
```

### Ventas desktop vs mobile
```tsx
// Desktop: sidebar product browser always visible
// Mobile: product browser in bottom sheet (controlled by useVentasUIStore)
{isDesktop && <SidebarProducts />}
{!isDesktop && <FooterProducts />}  {/* opens sheet */}
```
