# Requirements: La Pape — Production Polish Milestone

**Defined:** 2026-03-04
**Core Value:** A cashier can open the app, select products, process a payment, and get a receipt — reliably, every time, from any device.

## v1 Requirements

### Foundations

- [ ] **FOUND-01**: Firestore security rules hardened — authenticated users cannot read/write another negocio's data
- [ ] **FOUND-02**: Test infrastructure configured — jest-expo + @testing-library/react-native running with a passing smoke test
- [ ] **FOUND-03**: Error boundaries installed — no screen renders blank on unhandled error; Sentry captures the exception
- [ ] **FOUND-04**: @gorhom/bottom-sheet installed and compatible with New Architecture + Reanimated 4

### Discounts

- [ ] **DISC-01**: User can apply a percentage (%) discount to the cart total at checkout
- [ ] **DISC-02**: User can apply a fixed CLP amount discount to the cart total at checkout
- [ ] **DISC-03**: User can apply a discount to an individual product line in the cart
- [ ] **DISC-04**: Cart displays discounted subtotal and savings amount before completing the sale
- [ ] **DISC-05**: All discount calculations use Math.round() — no float totals are stored in Firestore

### Refunds

- [ ] **REFN-01**: TOCTOU bug in refund-venta.ts fixed — ventas_detalle re-read inside transaction via transaction.get()
- [ ] **REFN-02**: User can initiate a full refund from sales history with clear confirmation UX
- [ ] **REFN-03**: User can select specific line items from a past sale to partially refund
- [ ] **REFN-04**: Partial refund creates a ventas_reembolsos document and restores stock for refunded items only

### Reports

- [ ] **REPT-01**: User can view a revenue-over-time chart (daily / weekly / monthly toggle) in the resumen screen
- [ ] **REPT-02**: User can export sales data for the selected period as a CSV file via the device share sheet

### UI Polish

- [ ] **UIPOL-01**: All screens use consistent spacing, typography, and color tokens — no one-off inline values
- [ ] **UIPOL-02**: All screens have error boundaries — unhandled errors show a recovery message, not a blank screen
- [ ] **UIPOL-03**: All data-loading screens show a skeleton or spinner while Firestore data loads

## v2 Requirements

### Payments

- **PAY-01**: User can select payment method (cash / card / transfer) at checkout instead of defaulting to cash
- **PAY-02**: User can split payment across two methods (e.g. part cash + part card)
- **PAY-03**: App calculates and displays vuelto (change) when customer pays more cash than total

### Reports (extended)

- **REPT-03**: Reports screen shows payment method breakdown (cash vs card vs transfer) for the selected period

## Out of Scope

| Feature                           | Reason                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| Coupon codes                      | Marketing feature, not POS core — future milestone                  |
| Loyalty points / rewards          | Separate loyalty system, out of current scope                       |
| Scheduled / time-based promotions | High complexity, not needed for SME POS v1                          |
| Multi-payment split (v1)          | Depends on payment method picker (v2) being shipped first           |
| SII / accounting export           | Future milestone — CSV column names chosen for future compatibility |
| Kiosk / customer-facing display   | Future milestone                                                    |
| Mobile app store distribution     | Future milestone                                                    |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase   | Status  |
| ----------- | ------- | ------- |
| FOUND-01    | Phase 1 | Pending |
| FOUND-02    | Phase 1 | Pending |
| FOUND-03    | Phase 1 | Pending |
| FOUND-04    | Phase 1 | Pending |
| DISC-01     | Phase 2 | Pending |
| DISC-02     | Phase 2 | Pending |
| DISC-03     | Phase 2 | Pending |
| DISC-04     | Phase 2 | Pending |
| DISC-05     | Phase 2 | Pending |
| REFN-01     | Phase 3 | Pending |
| REFN-02     | Phase 3 | Pending |
| REFN-03     | Phase 3 | Pending |
| REFN-04     | Phase 3 | Pending |
| REPT-01     | Phase 4 | Pending |
| REPT-02     | Phase 4 | Pending |
| UIPOL-01    | Phase 5 | Pending |
| UIPOL-02    | Phase 5 | Pending |
| UIPOL-03    | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---

_Requirements defined: 2026-03-04_
_Last updated: 2026-03-04 after roadmap creation_
