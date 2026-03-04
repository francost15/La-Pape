# La Pape — Punto de Venta

## What This Is

La Pape is a multi-tenant point-of-sale system for Chilean businesses. It supports multiple users, branches (sucursales), and business entities (negocios). Currently in development/testing phase — core selling works, and the goal is to reach production readiness through design polish, test coverage, error hardening, and completing missing commercial features.

## Core Value

A cashier can open the app, scan or select products, process a payment, and get a receipt — reliably, every time, from any device.

## Requirements

### Validated

- ✓ User can authenticate with email/password and Google OAuth — existing
- ✓ Session persists and routes correctly after reload — existing
- ✓ Multi-tenant: users belong to negocios with roles, multiple sucursales — existing
- ✓ Product catalog: list, create, edit, delete products with categories — existing
- ✓ POS checkout: add items to cart, apply quantities, process sale — existing
- ✓ Sales history: browse past transactions — existing
- ✓ Analytics dashboard: KPIs, category breakdown, top products, low-stock alerts — existing
- ✓ Inventory movement tracking — existing

### Active

- [ ] User can apply discounts (% or fixed amount) at checkout
- [ ] User can split payment across multiple methods (cash + card)
- [ ] User can issue full or partial refund on a completed sale
- [ ] Advanced reports: revenue by period, product performance, export support
- [ ] All screens have consistent UI/UX polish (spacing, typography, color system)
- [ ] Critical paths have test coverage (checkout, auth, refunds)
- [ ] App surfaces meaningful error messages instead of crashing on failures
- [ ] Parallel agent workflow: design, test, debug, PM agents orchestrated per feature

### Out of Scope

- Customer-facing display / kiosk mode — future milestone
- Online store / e-commerce — separate product
- Accounting integrations (SII, contabilidad) — future milestone
- Native mobile app distribution (App Store / Play Store) — future milestone

## Context

- **Stack**: Expo Router v6, NativeWind v5, Zustand v5, Firebase Firestore + Auth, React Hook Form + Zod, Reanimated
- **Firebase collections**: usuarios, negocios, sucursales, usuarios-negocios, productos, categorias, ventas, ventas-detalle, ventas-pagos, clientes, inventario-movimientos
- **All services** live in `lib/services/<domain>/`
- **No tests** currently configured — needs full test setup from scratch
- **Agent workflow**: Claude acts as PM + orchestrates specialized agents (design, test, debug, context) running in parallel per phase

## Constraints

- **Tech stack**: Expo/React Native — must work on web, iOS, and Android
- **Currency**: Chilean peso (CLP), `es-CL` locale, formatted via `formatCurrency` from `@/lib/utils/format`
- **Styling**: NativeWind only — no inline styles, no StyleSheet
- **State**: Zustand — no Redux or Context for global state
- **No tests yet**: Need to introduce testing infrastructure as part of the project

## Key Decisions

| Decision                               | Rationale                                         | Outcome   |
| -------------------------------------- | ------------------------------------------------- | --------- |
| Brownfield — existing codebase as base | Core POS already works, build on it               | — Pending |
| Agent orchestration per phase          | Parallel design + test + debug agents per feature | — Pending |
| Firebase Firestore for all data        | Already established, real-time sync               | ✓ Good    |
| NativeWind for styling                 | Cross-platform Tailwind, already in use           | ✓ Good    |

---

_Last updated: 2026-03-03 after initialization_
