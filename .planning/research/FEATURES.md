# Feature Landscape

**Domain:** Point-of-Sale — commercial features milestone (discounts, split payment, refunds, reports)
**Researched:** 2026-03-03
**Confidence:** HIGH (based on codebase analysis + production POS domain knowledge)

---

## Current State Audit

Before categorizing features, it's essential to understand what already exists in the codebase
vs. what the active requirements describe.

### Already Built

| Capability                       | Status       | Notes                                                                                                         |
| -------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- | --------- | --------------- | -------- | ------------------------------------------------ |
| Discount field on Venta schema   | Schema ready | `descuento: number` on `Venta` interface and Firestore doc, but hardcoded to `0` in `completeVentaFlow`       |
| Payment method enum              | Schema ready | `MetodoPago: 'EFECTIVO'                                                                                       | 'TARJETA' | 'TRANSFERENCIA' | 'CHEQUE' | 'OTRO'`defined, but checkout hardcodes`EFECTIVO` |
| Multi-payment schema             | Schema ready | `ventas_pagos` collection supports multiple rows per `venta_id`, so split payment is additive at DB level     |
| Full refund flow                 | Partial      | `refundVentaFlow` changes estado to `REEMBOLSO`, restores all stock — but only whole-sale refunds, no partial |
| Sales history with period filter | Done         | week / month / year / custom range                                                                            |
| Analytics dashboard              | Done         | KPIs, category breakdown, top products, low-stock, vendor ranking                                             |
| Receipt generation + share       | Done         | PDF generation via `generateAndShareRecibo`                                                                   |

### Gaps (Active Requirements)

| Requirement                 | Gap                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| Apply discounts at checkout | UI missing; backend field exists but unused                                                |
| Split payment               | UI missing; backend schema supports it but hardcoded to `EFECTIVO`                         |
| Partial refund              | Both UI and backend service missing                                                        |
| Advanced reports + export   | Export missing; dashboard exists but no CSV/Excel export, no period-over-period comparison |

---

## Table Stakes

Features users expect in any production POS. Missing one of these causes abandonment or workarounds (pen + paper).

| Feature                                            | Why Expected                                                                                           | Complexity | Notes                                                                                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Percentage discount on cart total**              | Every Chilean negocio offers "10% off" or similar promotions; staff expect to key it in                | Low        | Schema exists (`descuento` field); add UI input + pass value through `completeVentaFlow`                                         |
| **Fixed-amount discount on cart total**            | Rounding off totals, VIP discounts ("$500 off") — extremely common at small businesses                 | Low        | Same path as % discount; store the applied mode (percent vs fixed) in checkout state                                             |
| **Discount visible on receipt**                    | Customer must see what they saved; legal expectation in CL                                             | Low        | `reciboData.descuento` field already flows through to receipt template                                                           |
| **Select payment method at checkout**              | Tarjeta, efectivo, transferencia are daily reality; hardcoding `EFECTIVO` breaks use cases immediately | Low        | UI picker before confirmation; pass `metodo_pago` into `completeVentaFlow` instead of hardcoding                                 |
| **Split payment (cash + card in one transaction)** | Common: customer pays part in cash, rest by card. Merchants will notice immediately if missing         | Medium     | `ventas_pagos` schema already supports multiple rows per `venta_id`; need UI to enter two amounts and validate they sum to total |
| **Full refund from history**                       | Already partially implemented; must be accessible and confirmed with clear feedback                    | Low        | `refundVentaFlow` exists; UI in history screen already wired — confirm flow needs polish                                         |
| **Partial refund (item-level)**                    | Customer returns one of three items; merchant cannot refund everything and resell the rest             | High       | Requires new service: select which detalle items to refund, recalculate amount, restore only those stock units                   |
| **Revenue totals by period**                       | Operators need to know daily / weekly / monthly totals at a glance for reconciliation                  | Low        | Already in `selectMetricas`; the KpiGrid shows this                                                                              |
| **Export sales data**                              | Accountants and owners need raw data for SII compliance or Excel analysis                              | Medium     | No export mechanism exists; must generate CSV or PDF summary and use native share sheet                                          |

---

## Differentiators

Features that set La Pape apart from generic POS apps in the Chilean SME market. Not expected on day one, but drive retention and referrals.

| Feature                                 | Value Proposition                                                                                     | Complexity | Notes                                                                                      |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| **Discount reason / note**              | Audit trail: who gave the discount and why (e.g. "cliente frecuente", "producto dañado")              | Low        | Add optional `nota_descuento` field to Venta; show in history card                         |
| **Per-item discount**                   | Apply discount to a single line item instead of the whole cart (useful for clearance pricing)         | Medium     | Requires discount state per CartItem; `ventas_detalle` would need `descuento_linea` field  |
| **Change calculation (vuelto)**         | Cashier enters cash received, app shows change due — essential for cash-heavy operations like kioscos | Low        | Pure UI calculation on top of completed payment flow; no backend change                    |
| **Trend comparison in reports**         | "This week vs last week" — gives operators actionable context without requiring spreadsheets          | Medium     | Requires second query window or dual-range computation in `selectMetricas`                 |
| **Top-loss products report**            | Products with highest refund rate — surfaces quality issues or cashier errors                         | Medium     | Cross-join REEMBOLSO ventas with their detalles; add to resumen module                     |
| **Discount summary in reports**         | Total discount given per period — useful for evaluating promotion effectiveness                       | Low        | Sum `descuento` across PAGADA ventas in existing `selectMetricas` selector                 |
| **Payment method breakdown in reports** | Revenue split by EFECTIVO vs TARJETA vs TRANSFERENCIA — helps with cash flow planning                 | Medium     | Requires joining `ventas_pagos` into analytics; resumen store currently doesn't load pagos |

---

## Anti-Features

Features to deliberately NOT build in this milestone. Including them would create scope creep, data model risk, or lock the product into complexity before the foundation is solid.

| Anti-Feature                                          | Why Avoid                                                                                                                                                   | What to Do Instead                                                                              |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Coupon / promo code system**                        | Requires coupon code storage, validation logic, expiry, one-time use tracking — a separate domain. Overkill for SME POS.                                    | Manual percentage or fixed discount at checkout covers the same need without backend complexity |
| **Customer loyalty points**                           | Points balance, redemption rules, expiry — a full sub-system. Clients table exists but is unused; plugging in loyalty now adds premature schema commitments | Leave cliente_id optional; loyalty is a post-production feature                                 |
| **Discount stacking (multiple concurrent discounts)** | Two simultaneous promotions create calculation ambiguity, receipt confusion, and audit complexity                                                           | One discount per sale (% OR fixed). Document this as a policy, not a technical limitation       |
| **Scheduled promotions (time-based discounts)**       | Auto-applying discounts based on time requires a rules engine. Adds backend complexity disproportionate to benefit                                          | Manual discount at checkout achieves the same outcome                                           |
| **Refund to card / bank reversal**                    | Actual payment reversal requires payment gateway integration (Transbank, MercadoPago) — none exists. Refund in La Pape is a bookkeeping action only         | Mark refund clearly as "registro de devolución" — physical money handling is out of scope       |
| **Multi-currency support**                            | La Pape is CLP-only. Chilean SMEs transact exclusively in CLP. Adding currency fields now creates data model complexity with zero current benefit           | Keep CLP / `es-CL` locale as a fixed constraint                                                 |
| **Inventory adjustment via refund UI**                | The refund flow already restores stock automatically. A separate inventory-adjustment screen is a different tool (stock take) and would confuse cashiers    | Keep refund and inventory adjustment as separate workflows                                      |
| **Full accounting / SII integration**                 | SII (Chilean tax authority) integration requires boleta electrónica, RUT validation, document numbering — a regulated domain requiring a separate product   | Acknowledge the gap in UI copy; export CSV as a bridge for accountants                          |

---

## Feature Dependencies

```
Payment method picker → Split payment UI
  (must be able to select one method before splitting into two)

Discount UI (% or fixed) → Discount on receipt
  (receipt must receive the discount amount from completeVentaFlow)

Discount UI → Discount summary in reports
  (reports can only aggregate discounts once they're being saved per sale)

Full refund (polished) → Partial refund
  (partial refund builds on the same UI flow; validate full refund works reliably first)

Partial refund service → Per-item refund in history card
  (UI needs the service to determine which items are refundable and in what quantities)

Payment method picker → Payment method breakdown in reports
  (analytics can only split by method once method is being recorded correctly)

Export → Trend comparison (optional dependency)
  (export and comparison can ship independently, but share the date-range query pattern)
```

---

## Specific Behavior Expectations

### Discount Flow

- Cashier can open a discount panel at any point before completing the sale.
- Two modes: percentage (e.g. 10%) and fixed amount (e.g. $500). Only one active at a time.
- Percentage is applied to subtotal (pre-tax; no tax in CL consumer context).
- Fixed discount is capped at subtotal — total cannot go below $0.
- Discount is shown as a line item in the cart summary: "Descuento: -$X".
- The value passed to `completeVentaFlow` must be the computed discount amount (not the rate), because `Venta.descuento` stores amounts, not rates.
- Receipt shows subtotal, descuento, and total as three separate lines.

### Split Payment Flow

- Cashier selects "Dividir pago" after cart is confirmed.
- UI presents two rows: method + amount for each split.
- Amounts must sum to total exactly; app validates before allowing completion.
- Each split creates one `ventas_pagos` document under the same `venta_id`.
- Receipt shows each payment method and its amount.
- This is "split at point of sale by cashier" — not customer-facing installments.

### Full Refund Flow (existing, polish scope)

- Available only on ventas with `estado === 'PAGADA'`.
- Confirm dialog shows the total amount and clarifies stock will be restored.
- After confirmation, `estado` becomes `'REEMBOLSO'` atomically with stock restoration.
- History card shows "Reembolsado" badge; the refund action button is disabled.
- Receipt generation is disabled for refunded sales (or generates a "Nota de crédito" copy — defer to v2).

### Partial Refund Flow (new)

- Cashier opens a refund screen/modal from the history card.
- List shows each line item with a toggle or quantity input.
- Cashier selects which items (and how many of each) to return.
- App computes refund amount: sum of (selected quantity \* precio_unitario) from ventas_detalle.
- On confirm:
  - Creates a new Venta document with `estado: 'REEMBOLSO_PARCIAL'` (new estado value needed) OR annotates the original venta with a partial refund reference.
  - Restores only the stock for selected items.
  - Records ENTRADA movements for each returned item.
- Recommended approach: create a sibling Venta document with negative totals linked to the original via a `venta_origen_id` field. Avoids mutating the original sale record and keeps the audit trail clean.

### Export Flow

- Available from both History screen and Resumen screen.
- Scope: current filtered period (uses the same `filterVentasByPeriodo` logic).
- Format: CSV with columns: fecha, venta_id, vendedor, productos, subtotal, descuento, total, metodo_pago, estado.
- Delivery: native share sheet (same pattern as `generateAndShareRecibo` — generate file, share via `expo-sharing`).
- PDF summary export (totals only, not line-by-line) is a secondary format — lower priority than CSV.

---

## MVP Recommendation

Build in this order to maximize cashier-facing value with minimum risk:

**Priority 1 — Checkout gaps (direct revenue impact)**

1. Payment method picker at checkout (unblocks real usage of TARJETA/TRANSFERENCIA)
2. Percentage discount on cart total (most common promo pattern)
3. Fixed-amount discount on cart total (complementary, same code path)
4. Change calculation (vuelto) display — pure UI, zero backend work

**Priority 2 — Payments (operational completeness)**

5. Split payment UI (backend already supports it; UI is the only gap)

**Priority 3 — Refunds (trust and returns)**

6. Full refund UX polish (flow exists; needs reliable error handling, disabled state after refund)
7. Partial refund service + UI (most complex feature; build after full refund is solid)

**Priority 4 — Reports (operator insight)**

8. Discount summary in existing reports (low effort once discounts are being saved)
9. Payment method breakdown in reports (requires joining ventas_pagos into resumen store)
10. CSV export from history / resumen screens

**Defer to a later milestone:**

- Per-item discount (complex cart state; low business urgency vs other gaps)
- Trend comparison (useful but not blocking operations)
- Top-loss products report (nice-to-have analytics)

---

## Sources

- Codebase analysis: `lib/services/ventas/complete-venta.ts`, `lib/services/ventas/refund-venta.ts`, `lib/services/ventas-pagos/index.ts`
- Schema analysis: `interface/ventas/index.ts`, `interface/ventas-pagos/index.ts`
- Store analysis: `store/ventas-store.ts`, `store/checkout-store.ts`, `store/resumen-store.ts`, `store/filtros-store.ts`
- UI analysis: `components/ventas/CartPanel.tsx`, `app/(tabs)/history/index.tsx`
- Domain expertise: Chilean SME POS patterns, production POS conventions (Square, iZettle, Bsale CL)
- Confidence: HIGH — schema already designed for all target features; gaps are UI and service orchestration, not data model redesign
