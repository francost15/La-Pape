# Architecture Patterns

**Domain:** Firebase Firestore POS — Discounts, Refunds, Multi-Payment, Advanced Reports
**Project:** La Pape
**Researched:** 2026-03-03
**Confidence:** HIGH — based on direct codebase analysis of existing services, interfaces, and stores

---

## Current Architecture Baseline

Before describing what to add, the existing system must be understood precisely, because all new
features extend—not replace—it.

### Existing Firestore Collections (actual field shapes)

```
ventas              { negocio_id, sucursal_id, usuario_id, cliente_id?,
                      fecha, subtotal, descuento (always 0 today), total,
                      estado: PENDIENTE|PAGADA|CANCELADA|REEMBOLSO|EN_PROCESO,
                      tipo_venta: CONTADO|CREDITO, notas?, createdAt, updatedAt }

ventas_detalle      { venta_id, producto_id, cantidad, precio_unitario,
                      total_linea, createdAt }

ventas_pagos        { venta_id, metodo_pago: EFECTIVO|TARJETA|TRANSFERENCIA|CHEQUE|OTRO,
                      monto, referencia?, createdAt }

productos           { negocio_id, nombre, categoria_id, precio_venta, precio_mayoreo,
                      costo_promedio, cantidad, imagen?, descripcion?, marca?,
                      stock_minimo?, activo, createdAt, updatedAt }

inventario_movimientos { producto_id, sucursal_id, tipo: ENTRADA|SALIDA|AJUSTE,
                         cantidad, motivo, usuario_id, fecha, createdAt }
```

### Existing Transaction Pattern

`completeVentaFlow` in `lib/services/ventas/complete-venta.ts` already uses
`runTransaction` with the mandatory reads-before-writes order. `refundVentaFlow`
in `lib/services/ventas/refund-venta.ts` does the same for full reversals.

This is the correct, proven pattern for all new write operations.

### Existing Reporting Pattern

`useResumenStore` (client-side) loads all `ventas` via `onSnapshot` real-time listener,
fetches `ventas_detalle` on demand, and runs pure selector functions
(`selectMetricas`, `selectProductosRanking`, `selectCategorias`, `selectVentasPorUsuario`)
against the in-memory data using `useMemo`. Period filtering (`filterVentasByPeriodo`)
is also pure client-side in `filtros-store.ts`.

---

## Recommended Architecture for New Features

### Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  UI Layer (Expo Router screens + NativeWind components)              │
│  ventas/index.tsx  ←→  CartPanel  ←→  DiscountPanel (new)          │
│  ventas/index.tsx  ←→  CartPanel  ←→  PaymentSplitSheet (new)      │
│  history/index.tsx ←→  VentaCard  ←→  PartialRefundSheet (new)     │
│  resumen/index.tsx ←→  KpiGrid, RevenueChart (new), ExportBtn (new) │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ reads / writes via Zustand stores
┌──────────────────────────▼──────────────────────────────────────────┐
│  Zustand Stores                                                       │
│  useVentasStore  — adds: discountAmount, discountType, discountNote  │
│  useCheckoutStore — adds: paymentSplits[]                            │
│  useResumenStore — unchanged; new selectors added beside existing     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ service calls (all in lib/services/)
┌──────────────────────────▼──────────────────────────────────────────┐
│  Service Layer (lib/services/<domain>/)                               │
│  ventas/complete-venta.ts  — extended (discount + multi-payment)      │
│  ventas/refund-venta.ts    — extended (partial refund support)        │
│  ventas/discount.ts        — new: discount validation helpers         │
│  reports/export.ts         — new: CSV/PDF generation                  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ Firestore runTransaction / onSnapshot
┌──────────────────────────▼──────────────────────────────────────────┐
│  Firestore Collections                                                │
│  ventas           — descuento field already exists, needs population  │
│  ventas_detalle   — add descuento_linea? (see below)                  │
│  ventas_pagos     — already supports multiple docs per venta          │
│  ventas_reembolsos — NEW collection (partial refund records)          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component                      | Responsibility                                                                      | Communicates With                    |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------ |
| `CartPanel` (existing)         | Renders cart items, hosts "Completar venta" CTA                                     | `useVentasStore`, `useCheckoutStore` |
| `DiscountPanel` (new)          | Input for % or fixed discount; updates store                                        | `useVentasStore` (discount fields)   |
| `PaymentSplitSheet` (new)      | Bottom sheet for multi-method payment splits                                        | `useCheckoutStore` (paymentSplits[]) |
| `completeVentaFlow` (extended) | Single atomic transaction: stock + venta + detalle + pagos(N) + descuento           | Firestore via `runTransaction`       |
| `PartialRefundSheet` (new)     | Item picker for partial refund, quantity stepper                                    | `refundVentaFlow` (extended)         |
| `refundVentaFlow` (extended)   | Full or partial refund: estado + stock + inventario_movimientos + ventas_reembolsos | Firestore via `runTransaction`       |
| `RevenueChart` (new)           | Time-series chart (victory-native) for resumen                                      | `useResumenStore` selectors          |
| `ExportButton` (new)           | Triggers CSV/PDF export via `reports/export.ts`                                     | `useResumenStore` (filtered data)    |

---

## Firestore Data Model Changes

### 1. Discounts — No new collections needed

The `ventas.descuento` field already exists but is always written as `0`.
The `ventas.subtotal` field is the pre-discount amount.

**Required changes:**

- Populate `descuento` in `completeVentaFlow` from the cart store.
- Add `descuento_tipo: 'PORCENTAJE' | 'MONTO_FIJO'` to `ventas` (optional field, omit if no discount).
- Add `descuento_nota?: string` to `ventas` for auditing (e.g., "Descuento empleado").
- `total` must always equal `subtotal - descuento` — enforce this in the service, not the UI.

**No schema migration** — adding optional fields to existing Firestore documents is non-breaking.

### 2. Multi-Payment — No new collections needed

`ventas_pagos` already supports multiple documents per `venta_id` because it's a
standalone collection keyed by `venta_id`. The existing `completeVentaFlow` writes
exactly one `ventas_pagos` document hardcoded to `EFECTIVO`. This must be extended
to accept an array of payment splits.

**Required changes to `completeVentaFlow` signature:**

```typescript
export interface PaymentSplit {
  metodo_pago: MetodoPago; // existing type union
  monto: number;
  referencia?: string;
}

export interface CompleteVentaParams {
  items: CartItem[];
  negocioId: string;
  sucursalId: string;
  userId: string;
  total: number;
  subtotal: number;
  descuento: number; // was missing, hardcoded to 0
  descuento_tipo?: "PORCENTAJE" | "MONTO_FIJO";
  descuento_nota?: string;
  pagos: PaymentSplit[]; // replaces implicit single EFECTIVO payment
}
```

**Validation rule:** `sum(pagos.monto) must equal total`. Throw a new `PaymentSplitError`
if validation fails — add to `lib/errors.ts`.

**Inside the transaction:** loop `params.pagos` and write one `ventas_pagos` document
per split. The reads-before-writes constraint is already satisfied since pagos docs are
new inserts (no read needed before writing).

### 3. Partial Refunds — New collection needed

The current `refundVentaFlow` supports only full refunds (sets `estado: 'REEMBOLSO'`
on the parent `ventas` document). Partial refunds require a more granular model.

**New collection: `ventas_reembolsos`**

```
ventas_reembolsos {
  id: string;
  venta_id: string;          // FK to ventas
  sucursal_id: string;
  usuario_id: string;
  fecha: Timestamp;
  tipo: 'TOTAL' | 'PARCIAL';
  monto_reembolsado: number;
  items: [                   // embedded — avoids subcollection complexity
    { producto_id: string, cantidad: number, monto_linea: number }
  ];
  motivo?: string;
  createdAt: Timestamp;
}
```

**Why embedded items, not a subcollection:** Partial refund items are always read
together with the refund document. Embedding avoids an extra Firestore read and keeps
the refund atomic within a single document write.

**Estado transitions on `ventas`:**

```
PAGADA ──► REEMBOLSO_PARCIAL  (one or more line items returned, sale not fully reversed)
PAGADA ──► REEMBOLSO          (all items returned, existing behavior unchanged)
REEMBOLSO_PARCIAL ──► REEMBOLSO  (subsequent full refund of remaining items)
```

Add `REEMBOLSO_PARCIAL` to `VentaEstado` union in `interface/ventas/index.ts`.

**Extended `refundVentaFlow` signature:**

```typescript
export interface RefundItem {
  producto_id: string;
  cantidad: number; // must be <= original ventas_detalle.cantidad
}

export interface RefundVentaParams {
  ventaId: string;
  sucursalId: string;
  userId: string;
  tipo: "TOTAL" | "PARCIAL";
  items?: RefundItem[]; // required when tipo === 'PARCIAL'
  motivo?: string;
}
```

**Transaction flow (extended):**

1. Read `ventas` doc — validate `estado` is not already `REEMBOLSO`.
2. If `tipo === 'PARCIAL'`: read each `productos` doc for stock restoration (reads before writes rule).
3. If `tipo === 'TOTAL'`: existing behavior, read all `ventas_detalle` items.
4. Write `ventas_reembolsos` doc.
5. Update `ventas.estado` (REEMBOLSO_PARCIAL or REEMBOLSO) and `ventas.updatedAt`.
6. Update `productos.cantidad` for each returned item.
7. Write `inventario_movimientos` docs for each product (tipo: 'ENTRADA').

**Pre-read of `ventas_detalle` for partial refunds:** `ventas_detalle` is fetched
outside the transaction (as `getDetallesByVenta` already does) to validate that
requested quantities don't exceed what was sold. Throw a new `InvalidRefundError`
if any `RefundItem.cantidad > detalle.cantidad`.

### 4. Advanced Reports — No new collections needed

All data required for advanced reports (revenue by period, product performance,
category breakdown, vendor breakdown) already exists in `ventas` + `ventas_detalle`.

**The existing client-side aggregation approach is correct and should be extended.**
Do NOT introduce Cloud Functions for aggregation at this scale.

**Rationale:** The app already streams all `ventas` via `onSnapshot` and computes
metrics client-side with `useMemo`. For a single-negocio dataset, the number of
ventas documents at this stage (hundreds to low thousands) keeps this performant.
Cloud Functions add latency, cost, and complexity without benefit until the dataset
grows to tens of thousands of ventas per query window.

**New selectors to add alongside existing ones in `resumen-store.ts`:**

```typescript
// Revenue bucketed by day/week/month for a time-series chart
selectRevenueSeries(ventas: Venta[], granularity: 'dia' | 'semana' | 'mes'): RevenueBucket[]

// Average ticket, busiest hour, payment method breakdown
selectPaymentMethodBreakdown(ventas: Venta[], pagosMap: Record<string, VentaPago[]>): PaymentMethodStat[]

// pagosMap loading: mirror the detallesMap pattern — fetch ventas_pagos per venta on demand
```

**For `selectPaymentMethodBreakdown`:** a `pagosMap` (keyed by `venta_id`) must be
loaded in `useResumenStore.subscribe()`, mirroring the existing `detallesMap` pattern.
Only `PAGADA` ventas pagos are fetched; the lazy-with-retry approach is reused verbatim.

**Export (CSV/PDF):**

```
lib/services/reports/export.ts
  exportVentasCSV(ventas, detallesMap, products) → string (CSV content)
  exportVentasPDF(ventas, metricas) → triggers generateAndShareRecibo pattern
```

Use `expo-sharing` (already in Expo ecosystem) for the share sheet.
CSV is client-side string assembly — no server needed.
PDF generation follows the existing `lib/pdf/generate-recibo.ts` pattern.

---

## Data Flow Direction

```
Discount:
  DiscountPanel ──(updates)──► useVentasStore {discountAmount, discountType}
  CartPanel total display ←── useVentasStore.getDiscountedTotal() (derived)
  CartPanel "Completar" ──► completeVentaFlow({..., descuento, pagos})
  completeVentaFlow ──► Firestore [ventas.descuento, ventas_pagos(N)]

Multi-Payment:
  PaymentSplitSheet ──(updates)──► useCheckoutStore {paymentSplits[]}
  CartPanel reads sum validation from useCheckoutStore
  CartPanel "Completar" ──► completeVentaFlow({..., pagos: paymentSplits})

Partial Refund:
  history/index.tsx ──► PartialRefundSheet (item+qty picker)
  PartialRefundSheet ──► refundVentaFlow({tipo:'PARCIAL', items:[...]})
  refundVentaFlow ──► Firestore [ventas_reembolsos, ventas.estado, productos.cantidad, inventario_movimientos]
  useProductosStore optimistic update (mirrors existing full-refund pattern in history/index.tsx)

Reports:
  useResumenStore.subscribe() streams ventas + fetches detallesMap + pagosMap (new)
  selectRevenueSeries / selectPaymentMethodBreakdown (new selectors, pure functions)
  ResumenScreen useMemo → RevenueChart / PaymentMethodChart components
  ExportButton ──► lib/services/reports/export.ts ──► expo-sharing
```

---

## Patterns to Follow

### Pattern 1: Reads-Before-Writes in Firestore Transactions

Every `runTransaction` must complete ALL reads before ANY writes. This is enforced by
the Firestore SDK and will throw if violated.

```typescript
// CORRECT (existing pattern in completeVentaFlow — follow this exactly)
await runTransaction(db, async (transaction) => {
  // Phase 1: ALL reads
  const ventaSnap = await transaction.get(ventaRef);
  const productSnaps = await Promise.all(productRefs.map(r => transaction.get(r)));

  // Phase 2: ALL writes
  transaction.set(ventaRef, {...});
  transaction.update(productRefs[0], {...});
});
```

### Pattern 2: Discount Calculation in Service, Not UI

Never compute `total = subtotal - descuento` in a component. Compute and validate in
`completeVentaFlow`. The store holds the raw discount input; the service enforces
that `subtotal - descuento === total` before writing to Firestore.

```typescript
// In completeVentaFlow validation (before transaction)
const computedTotal = params.subtotal - params.descuento;
if (Math.abs(computedTotal - params.total) > 0.01) {
  throw new VentaError("Total no coincide con subtotal menos descuento");
}
```

### Pattern 3: Optimistic Local Stock Update

Existing: after `completeVentaFlow` and `refundVentaFlow`, `history/index.tsx` and
`CartPanel` update `useProductosStore` locally without refetch.

```typescript
// Follow this pattern for partial refund too
const currentProducts = useProductosStore.getState().products;
const updated = currentProducts.map((p) => {
  const refundedItem = refundItems.find((i) => i.producto_id === p.id);
  return refundedItem ? { ...p, cantidad: p.cantidad + refundedItem.cantidad } : p;
});
useProductosStore.getState().setProducts(updated);
```

### Pattern 4: Selector Purity for Reports

All report selectors are pure functions (no side effects, no store reads inside).
They receive data as arguments and return derived values. This enables `useMemo`
invalidation to work correctly.

```typescript
// Correct pattern (existing selectMetricas, selectProductosRanking, etc.)
export function selectRevenueSeries(
  ventas: Venta[],
  granularity: "dia" | "semana" | "mes"
): RevenueBucket[] {
  // pure transformation, no store access
}
```

### Pattern 5: Lazy pagosMap Loading (Mirror of detallesMap)

The existing `detallesMap` pattern fetches details on first encounter and caches:

```typescript
// In useResumenStore.subscribe() — add alongside detallesMap
const pagosCache: Record<string, VentaPago[]> = {};

// On each ventas snapshot, fetch pagos for any new venta_ids
const pagosIdsToFetch = ventasFromDb
  .filter((v) => v.estado === "PAGADA")
  .map((v) => v.id)
  .filter((id) => !pagosCache[id]);

// Fetch getPagosByVenta (new service function) for each id
```

Add `getPagosByVenta(venta_id: string): Promise<VentaPago[]>` to
`lib/services/ventas-pagos/index.ts`.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Discount Logic in the UI Component

**What:** Compute `total - discount` inside `CartPanel` or `DiscountPanel` and pass
the result directly to Firestore.
**Why bad:** Rounding errors on CLP (no decimals in practice), inconsistent behavior
across platforms, no server-side validation.
**Instead:** Store raw `discountAmount` and `discountType` in `useVentasStore`.
The service computes and validates the final total inside `completeVentaFlow`.

### Anti-Pattern 2: Multiple Separate Firestore Writes for One Sale

**What:** Write `ventas`, then separately write `ventas_detalle`, then `ventas_pagos`
outside a transaction.
**Why bad:** Any failure between writes leaves orphaned documents. The existing
codebase already avoids this — do not regress.
**Instead:** All writes for a single sale must be inside one `runTransaction` call,
as established in `completeVentaFlow`.

### Anti-Pattern 3: Cloud Functions for Report Aggregation

**What:** Moving `selectMetricas` / `selectRevenueSeries` to Cloud Functions to
"reduce client load".
**Why bad:** Adds 100-300ms cold-start latency, billing complexity, deployment
friction, and makes the app offline-incapable. Client-side `useMemo` on a real-time
snapshot is instantaneous and free.
**Instead:** Keep aggregation client-side until a concrete performance problem emerges
(benchmark: >5,000 ventas in one query window before considering this).

### Anti-Pattern 4: Subcollections for Refund Items

**What:** Storing partial refund line items as a subcollection of `ventas_reembolsos`.
**Why bad:** Each refund display requires N+1 reads (parent + each item subcollection).
Refund items are always read together and never updated individually.
**Instead:** Embed refund items array directly in the `ventas_reembolsos` document.
Firestore document size limit is 1 MB — even 100 items is well under that.

### Anti-Pattern 5: Modifying ventas_detalle on Refund

**What:** Updating `ventas_detalle` quantities when a partial refund is issued.
**Why bad:** Destroys the original sale record, makes receipt generation incorrect,
breaks audit trails.
**Instead:** Leave `ventas_detalle` immutable. The `ventas_reembolsos` collection
records what was returned. Reports exclude refunded quantities by checking
`ventas_reembolsos` docs for a given `venta_id`.

---

## Build Order — Which Features Depend on Others

Feature dependencies determine the sequence. Build in this order:

```
1. Discounts (prerequisite for correct totals everywhere)
   └─ Extends: useVentasStore + completeVentaFlow + CartPanel
   └─ Unblocks: multi-payment (needs correct total to validate splits)

2. Multi-Payment (depends on correct subtotal/total from discounts)
   └─ Extends: useCheckoutStore + completeVentaFlow + CartPanel
   └─ Unblocks: payment method breakdown in reports

3. Partial Refunds (depends on nothing from 1 & 2, but benefits from audited totals)
   └─ New: ventas_reembolsos collection + extended refundVentaFlow
   └─ Extends: history/index.tsx + refundVentaFlow + VentaCard
   └─ Unblocks: accurate devolution metrics in reports

4. Advanced Reports + Export (depends on 1+2+3 for correct data shape)
   └─ Extends: useResumenStore (pagosMap) + new selectors
   └─ New: lib/services/reports/export.ts + RevenueChart + ExportButton
```

**Forced ordering rationale:**

- Discounts must come first because every downstream feature reads `ventas.descuento`
  and `ventas.total`. Writing discounts = 0 while implementing multi-payment means
  payment split totals would validate against wrong subtotals.
- Multi-payment before reports because `selectPaymentMethodBreakdown` needs
  `ventas_pagos` to have real data from split transactions.
- Partial refunds before reports because reports must exclude partial refund quantities
  from product performance metrics; if reports ship first, the selectors need
  rework when partial refunds land.

---

## Scalability Considerations

| Concern                     | Current (hundreds of ventas)   | At 10K ventas                                    | At 100K+ ventas                                             |
| --------------------------- | ------------------------------ | ------------------------------------------------ | ----------------------------------------------------------- |
| Report aggregation          | `useMemo` client-side, instant | Still feasible; `onSnapshot` may stream 10K docs | Move to Cloud Functions with pre-aggregated daily summaries |
| Real-time `onSnapshot` cost | Negligible reads               | Monitor Firestore read costs                     | Paginate or archive old ventas to separate collection       |
| `ventas_reembolsos`         | Simple collection scan         | Index on `venta_id` (auto-created)               | No changes needed                                           |
| `ventas_pagos` pagosMap     | N fetches for N ventas         | Cache effectiveness increases; no change needed  | Consider denormalizing pagos into ventas document           |
| Export CSV                  | Client-side string, instant    | Still instant                                    | Still instant (export is always filtered by period)         |

**Current recommendation:** All features client-side. No Cloud Functions. Revisit
when real-time listener streams >5,000 documents for a single negocio.

---

## Firestore Rules Changes Needed

```javascript
// Add to firestore.rules when ventas_reembolsos is created:
match /ventas_reembolsos/{reembolsoId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated()
    && request.resource.data.monto_reembolsado > 0
    && request.resource.data.tipo in ['TOTAL', 'PARCIAL'];
  // No update/delete: refunds are immutable audit records
}
```

The existing `ventas` rule already allows `update` for authenticated users, which
covers the `estado: REEMBOLSO_PARCIAL` transition.

---

## Sources

- Direct analysis of `/lib/services/ventas/complete-venta.ts` (existing transaction pattern)
- Direct analysis of `/lib/services/ventas/refund-venta.ts` (refund flow baseline)
- Direct analysis of `/interface/ventas/*.ts`, `/interface/ventas-pagos/*.ts` (data shapes)
- Direct analysis of `/store/resumen-store.ts` (selector pattern, detallesMap loading)
- Direct analysis of `/store/ventas-store.ts` and `/store/checkout-store.ts` (cart state)
- Direct analysis of `/app/(tabs)/history/index.tsx` (refund UI + optimistic stock update)
- Direct analysis of `/firestore.rules` (security rule baselines)
- Confidence: HIGH — all claims are grounded in the actual codebase, not training data assumptions
