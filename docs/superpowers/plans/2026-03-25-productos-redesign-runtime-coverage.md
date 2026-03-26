# Productos Redesign + Runtime Fix + Coverage Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a high-quality `Productos` experience with distinct mobile/desktop layouts, fix the `import.meta` web runtime error at the root cause, and raise overall test coverage to at least 50% without breaking runtime.

**Architecture:** Keep `Productos` responsive from a single source of truth (`useLayoutStore((s) => s.isMobile)`), but split desktop/mobile presentation into focused product-list UI components. Treat runtime debugging and coverage work as separate implementation slices so UI changes do not get mixed with tooling fixes. Preserve Expo Router + NativeWind patterns, and keep test/tooling artifacts isolated from app runtime.

**Tech Stack:** Expo Router, React Native, NativeWind, Zustand, expo-image, React Native Reanimated, Vitest, Expo web.

---

## File map

### UI redesign

- Modify: `app/(tabs)/productos/index.tsx`
  - Keep screen orchestration, search/category/pagination wiring, and responsive mode selection.
- Create: `components/products/ProductsToolbar.tsx`
  - Shared top section with title, counts, search, create CTA; desktop/mobile-aware layout props.
- Create: `components/products/ProductDesktopCard.tsx`
  - Desktop hybrid POS card.
- Create: `components/products/ProductMobileRow.tsx`
  - Mobile compact POS row.
- Modify: `components/cards/card-products.tsx`
  - Either turn into a thin compatibility wrapper or remove callsites in favor of the two new components.
- Modify: `constants/typography.ts`
  - Tighten font role usage if needed, but avoid cross-platform regressions.
- Optional create: `components/products/ProductStockBadge.tsx`
  - Create only if both new product components need the exact same stock badge.

### Runtime error investigation/fix

- Inspect/possibly modify: `app/_layout.tsx`
- Inspect/possibly modify: `app/(tabs)/productos/index.tsx`
- Inspect/possibly modify: `components/ui/PerformanceMonitor.tsx`
- Inspect/possibly modify: `components/ui/PerformanceReport.tsx`
- Inspect/possibly modify: `lib/utils/profiler.ts`
- Inspect/possibly modify: `scripts/benchmark.ts`
- Inspect/possibly modify: `package.json`
- Inspect/possibly modify: `vitest.config.ts`
- Optional create: `docs/runtime/import-meta-root-cause.md`
  - Only if documenting the root cause meaningfully improves handoff.

### Coverage expansion

- Modify/create under: `src/test/**/*.test.ts(x)`
- Modify: `vitest.config.ts`
- Create: `vitest.ui.config.ts`
  - Mandatory secondary test config for component/UI tests; use the environment proven compatible with the suite.
- Modify: `package.json`
  - Add explicit scripts for UI test execution and combined coverage measurement.
- Create: `scripts/coverage-total.mjs`
  - Combine runtime + UI coverage summaries into one total line coverage result.

---

## Chunk 1: Productos redesign

### Baseline gate for all chunks

**Files:**

- No code changes

- [ ] **Step 0: Record the current baseline before making changes**

Run:

```bash
npm run lint && npm test && npm run test:coverage
```

Record:

- lint status
- test status
- overall line coverage baseline (`35.22%` at plan-writing time)

Use this baseline to separate pre-existing behavior from regressions introduced during execution.

### Task 1: Lock the responsive shell and split presentation

**Files:**

- Modify: `app/(tabs)/productos/index.tsx`
- Create: `components/products/ProductsToolbar.tsx`
- Create: `components/products/ProductDesktopCard.tsx`
- Create: `components/products/ProductMobileRow.tsx`
- Test: defer component tests for these new files to Chunk 3 after UI test environment is made explicit

- [ ] **Step 1: Lock screen responsibilities before moving code**

Keep in `ProductosScreen` only:

- fetch / refresh / retry wiring
- search/category/pagination state
- responsive mode selection
- error/loading/empty state orchestration

Move out of `ProductosScreen` into presentational components only:

- toolbar layout
- desktop product card
- mobile product row

- [ ] **Step 2: Define the responsive rendering contract before moving code**

Implement this rule in `app/(tabs)/productos/index.tsx`:

- `isMobile === true` → render mobile list layout only
- `isMobile === false` → render desktop grid layout only
- inside desktop only, use `useWindowDimensions()` to derive column count:
  - `768-1279`: 2 columns
  - `1280+`: 3 columns
- for the desktop `FlashList`, set `numColumns` from that computed column count and key the list by column count so layout resets cleanly when width crosses thresholds

- [ ] **Step 3: Extract the toolbar component**

`ProductsToolbar.tsx` must accept explicit props for:

- `isMobile`
- `searchText`
- `onSearchChange`
- `searchInputRef`
- `onCreateProduct`
- `resultCount`
- `categories`
- `selectedCategoryId`
- `onCategoryPress`

Desktop behavior:

- single compact header block
- search + CTA on same line
- result count visible

Mobile behavior:

- stacked layout
- search first
- CTA still easy to reach

- [ ] **Step 4: Write the desktop card first**

In `ProductDesktopCard.tsx`, implement the hybrid POS desktop card with this hierarchy:

- contained image at top
- stock badge visible in the data block
- sale price visually stronger than wholesale price
- name max 2 lines
- metadata quieter

The card must expose:

- image
- product name
- sale price
- stock state
- secondary metadata

Use web-only hover refinement only on web, and native press feedback only on iOS/Android.

- [ ] **Step 5: Write the mobile row separately**

In `ProductMobileRow.tsx`, implement a compact row with:

- image left
- name + metadata center
- price + stock right
- one-column list only
- no heavy card chrome

- [ ] **Step 6: Update the screen to use the new components**

In `app/(tabs)/productos/index.tsx`:

- keep search/category/pagination wiring intact
- keep error/loading/refresh/empty states intact
- replace `CardProducts` rendering with:
  - `ProductMobileRow` when `isMobile`
  - `ProductDesktopCard` when not `isMobile`

- [ ] **Step 7: Resolve `card-products.tsx` explicitly**

Decision rule:

- Use **Outcome B** for `Productos`: stop using `card-products.tsx` in the `Productos` screen and keep the screen on the new dedicated components
- Use `card-products.tsx` only for other existing callers that still need it

Do not leave two overlapping active implementations for the `Productos` screen.

- [ ] **Step 8: Run lint and validate no UI-state regressions**

Run:

```bash
npm run lint
```

Expected: pass with 0 errors.

- [ ] **Step 9: Manual verification on web/mobile layouts**

Run:

```bash
npm run web
```

Manual checklist:

- desktop shows 2 or 3 column grid depending on width
- mobile shows single-column compact list
- every visible product shows image, name, sale price, stock state
- search works
- create CTA works
- tapping a product still opens detail
- empty state still works

Use these exact Expo web viewport widths for verification:

- `390px` → mobile
- `1024px` → desktop 2-column
- `1440px` → desktop 3-column

- [ ] **Step 10: Commit chunk 1 work**

```bash
git add "app/(tabs)/productos/index.tsx" "components/products/ProductsToolbar.tsx" "components/products/ProductDesktopCard.tsx" "components/products/ProductMobileRow.tsx" "components/cards/card-products.tsx"
test -f "components/products/ProductStockBadge.tsx" && git add "components/products/ProductStockBadge.tsx" || true
git commit -m "feat(productos): redesign mobile and desktop catalog layouts"
```

### Task 2: Tighten typography and hierarchy in Productos

**Files:**

- Modify: `components/products/ProductDesktopCard.tsx`
- Modify: `components/products/ProductMobileRow.tsx`
- Modify: `components/products/ProductsToolbar.tsx`
- Modify: `constants/typography.ts` (only if mapping adjustment is actually needed)

- [ ] **Step 1: Map font roles to exact elements**

Apply this mapping:

- desktop price: strongest numeric emphasis available without harming consistency
- stock badge: `heading` or `bodyStrong`
- product name: `bodyStrong`
- metadata: `body`
- mobile price: `heading` or `bodyStrong`
- mobile stock: `bodyStrong`

- [ ] **Step 2: Remove decorative excess from Productos only**

Keep the app identity, but ensure `Productos` feels utilitarian POS:

- no overuse of `display`
- no decorative font usage on metadata
- no weak price hierarchy

- [ ] **Step 3: Re-run visual verification**

Check:

- sale price is clearly stronger than wholesale price
- stock is readable at a glance
- product name still fits naturally on both layouts

- [ ] **Step 4: Commit typography polish**

```bash
git add "components/products/ProductsToolbar.tsx" "components/products/ProductDesktopCard.tsx" "components/products/ProductMobileRow.tsx" "constants/typography.ts"
test -f "components/products/ProductStockBadge.tsx" && git add "components/products/ProductStockBadge.tsx" || true
git commit -m "style(productos): refine visual hierarchy and typography"
```

---

## Chunk 2: Root-cause fix for `import.meta may only appear in a module`

### Task 3: Reproduce and isolate the real source

**Files:**

- Inspect: `package.json`
- Inspect: `app/_layout.tsx`
- Inspect: `app/(tabs)/productos/index.tsx`
- Inspect: `components/ui/PerformanceMonitor.tsx`
- Inspect: `components/ui/PerformanceReport.tsx`
- Inspect: `lib/utils/profiler.ts`
- Inspect: `scripts/benchmark.ts`
- Inspect: `vitest.config.ts`
- Optional create: `docs/runtime/import-meta-root-cause.md`

- [ ] **Step 1: Reproduce the error on the exact suspect surfaces**

Run:

```bash
npm run web
```

Capture:

- whether it fails on initial app boot (`app/_layout.tsx` path)
- whether it fails after opening `/(tabs)/productos`
- whether it fails after opening `configuracion`
- browser console message
- stack / source asset / file if available

- [ ] **Step 2: Identify the import chain before editing anything**

Determine:

- which exact file/asset contains `import.meta`
- whether it is app runtime code, test tooling, profiling code, or an indirect dependency
- what imports it into the web bundle

- [ ] **Step 3: Write the failing evidence down**

If the root cause is not obvious within one import hop, create `docs/runtime/import-meta-root-cause.md` with:

- reproduction command
- failing file/asset
- import chain
- why it reached runtime

- [ ] **Step 4: Choose the smallest boundary-correct fix**

Allowed fix directions:

- isolate tool-only files from runtime imports
- remove accidental runtime references to benchmark/profiler/test-only modules
- split config so web runtime never touches a tooling-only path
- rewrite only the offending usage if it is truly required in runtime

Not allowed:

- blind suppression
- deleting unrelated tooling without evidence
- speculative edits across many files at once

- [ ] **Step 5: Implement the minimal root-cause fix**

Touch only the files proven by the investigation.

- [ ] **Step 6: Verify the error is actually gone**

Run:

```bash
npm run web
```

Expected:

- no `import.meta may only appear in a module` error in browser console
- Productos screen still loads

- [ ] **Step 7: Run regression checks**

Run:

```bash
npm run lint && npm test
```

Expected: all green.

- [ ] **Step 8: Commit the runtime fix**

```bash
git add app/_layout.tsx "app/(tabs)/productos/index.tsx" "components/ui/PerformanceMonitor.tsx" "components/ui/PerformanceReport.tsx" "lib/utils/profiler.ts" "scripts/benchmark.ts" package.json vitest.config.ts
test -f docs/runtime/import-meta-root-cause.md && git add docs/runtime/import-meta-root-cause.md || true
git commit -m "fix(web): resolve import.meta runtime error"
```

---

## Chunk 3: Coverage increase to 50%+

### Task 4: Measure baseline and separate safe test scope

**Files:**

- Modify: `vitest.config.ts`
- Create: `vitest.ui.config.ts`
- Modify: `package.json`
- Create: `scripts/coverage-total.mjs`

- [ ] **Step 1: Measure the exact current baseline**

Run:

```bash
npm run test:coverage
```

Record the reported overall line coverage from the generated summary.

Use `coverage/coverage-summary.json` as the source of truth for file selection if it is generated.

- [ ] **Step 2: Decide whether component tests need a separate config**

This step is mandatory because Chunk 3 includes component/UI tests.

Create `vitest.ui.config.ts` and split coverage responsibility explicitly:

- `vitest.config.ts`
  - keep `environment: "node"`
  - keep coverage focused on non-UI runtime-safe targets such as `lib/**/*.ts`, `store/**/*.ts`, `interface/**/*.ts`
- `vitest.ui.config.ts`
  - use the environment that is proven compatible with the current React Native component tests; default to `node` unless a failing experiment proves `jsdom` is required
  - include UI/component tests
  - set `coverage.include` to `components/ui/**/*.tsx` plus `components/products/**/*.tsx` created in Chunk 1
- `package.json`
  - add `test:ui:run`
  - add `test:coverage:ui`
  - add `test:coverage:all` that runs runtime coverage to `coverage/runtime`, UI coverage to `coverage/ui`, then `node scripts/coverage-total.mjs`

Success rule:

- runtime-safe tests remain isolated from UI-environment tests
- no runtime code imports test-only modules

Expected outcome:

- runtime suite and UI suite can run independently
- coverage for UI files comes from the UI config, not from the node config

- [ ] **Step 3: Commit config separation**

This step is no longer optional in this plan because the coverage target depends on both suites.

Update `package.json` with explicit scripts such as:

- `test:ui:run`: `vitest run --config vitest.ui.config.ts`
- `test:coverage:ui`: `vitest run --config vitest.ui.config.ts --coverage --coverage.reportsDirectory=coverage/ui`
- `test:coverage`: runtime coverage writes to `coverage/runtime`
- `test:coverage:all`: run runtime coverage, run UI coverage, then `node scripts/coverage-total.mjs`

`scripts/coverage-total.mjs` must read:

- `coverage/runtime/coverage-summary.json`
- `coverage/ui/coverage-summary.json`

and print one combined overall line-coverage value.

Before committing, verify the config split works:

```bash
npm test && npm run test:ui:run
```

```bash
git add vitest.config.ts vitest.ui.config.ts package.json scripts/coverage-total.mjs
git commit -m "test: separate runtime and ui coverage configs"
```

### Task 5: Add the highest-value missing tests first

**Files:**

- Create: `src/test/stores/theme-store.test.ts`
- Create: `src/test/stores/onboarding-store.test.ts`
- Optional create: `src/test/stores/resumen-store.test.ts`
- Create: `src/test/lib/logger.test.ts`
- Create: `src/test/lib/feature-flags.test.ts`
- Create: `src/test/lib/profiler.test.ts`
- Create: `src/test/components/EmptyState.test.tsx`
- Create: `src/test/components/ErrorBoundary.test.tsx`
- Create: `src/test/components/ThemeToggle.test.tsx`
- Create: `src/test/components/OfflineBanner.test.tsx`
- Create: `src/test/components/SkipLink.test.tsx`
- Create: `src/test/components/CircleIconButton.test.tsx`
- Create: `src/test/components/ConfirmAlert.test.tsx`
- Create: `src/test/components/AnimatedScreen.test.tsx`
- Create: `src/test/components/ProductDesktopCard.test.tsx`
- Create: `src/test/components/ProductMobileRow.test.tsx`
- Create: `src/test/components/ProductsToolbar.test.tsx`

- [ ] **Step 1: Re-rank candidates from the real report, then execute**

Use `coverage/runtime/coverage-summary.json` and the UI coverage summary to identify the files with the largest uncovered line counts.

Start from this seed list because these are currently obvious gaps, then re-rank by actual uncovered lines before writing tests:

1. `store/theme-store.ts`
2. `store/onboarding-store.ts`
3. `lib/utils/logger.ts`
4. `lib/services/feature-flags.ts`
5. `lib/utils/profiler.ts`
6. `components/ui/EmptyState.tsx`
7. `components/ui/ErrorBoundary.tsx`
8. `components/ui/OfflineBanner.tsx`
9. `components/ui/SkipLink.tsx`
10. `components/ui/ThemeToggle.tsx`
11. `components/ui/CircleIconButton.tsx`
12. `components/ui/ConfirmAlert.tsx`
13. `components/ui/AnimatedScreen.tsx`
14. `components/products/ProductDesktopCard.tsx`
15. `components/products/ProductMobileRow.tsx`
16. `components/products/ProductsToolbar.tsx`
17. `store/resumen-store.ts` only if overall line coverage is still below 50% after items 1-16 are complete

Decision rule:

- Always pick the next file with the highest uncovered-line payoff among the safe-scope candidates
- Do not spend time on auth/firebase/pdf files in this slice unless all safe-scope candidates are exhausted and coverage is still below target

- [ ] **Step 2: For each uncovered logic file, use TDD in micro-cycles**

Per file:

- write a failing test
- run the focused test to confirm failure
- implement the minimal logic/test setup needed
- rerun the focused test
- move to next uncovered behavior

Focused commands example:

```bash
npm test -- src/test/stores/theme-store.test.ts
npm test -- src/test/lib/logger.test.ts
npx vitest run --config vitest.ui.config.ts src/test/components/ErrorBoundary.test.tsx
```

- [ ] **Step 3: Avoid risky coverage inflation**

Do not:

- import runtime UI screens into unstable test environments just to chase numbers
- add fake tests that only assert module existence
- loosen assertions to inflate coverage
- add component tests before coverage include/env separation is explicit

- [ ] **Step 4: Re-measure after each meaningful batch**

Run:

```bash
npm run test:coverage:all
```

Stop only when `test:coverage:all` reports combined overall line coverage **50% or higher** and the suite remains stable.

- [ ] **Step 5: Run full regression**

Run:

```bash
npm run lint && npm test && npm run test:ui:run && npm run test:coverage:all
```

Expected:

- lint green
- test green
- UI test suite green
- combined overall line coverage >= 50%

- [ ] **Step 6: Commit the coverage increase**

```bash
git add "src/test/stores/theme-store.test.ts" "src/test/stores/onboarding-store.test.ts" "src/test/lib/logger.test.ts" "src/test/lib/feature-flags.test.ts" "src/test/lib/profiler.test.ts" "src/test/components/EmptyState.test.tsx" "src/test/components/ErrorBoundary.test.tsx" "src/test/components/ThemeToggle.test.tsx" "src/test/components/OfflineBanner.test.tsx" "src/test/components/SkipLink.test.tsx" "src/test/components/CircleIconButton.test.tsx" "src/test/components/ConfirmAlert.test.tsx" "src/test/components/AnimatedScreen.test.tsx" "src/test/components/ProductDesktopCard.test.tsx" "src/test/components/ProductMobileRow.test.tsx" "src/test/components/ProductsToolbar.test.tsx" vitest.config.ts vitest.ui.config.ts package.json scripts/coverage-total.mjs
test -f "src/test/stores/resumen-store.test.ts" && git add "src/test/stores/resumen-store.test.ts" || true
git commit -m "test: raise coverage to 50 percent"
```

---

## Chunk 4: Final verification and handoff

### Task 6: Validate the whole feature bundle end to end

**Files:**

- No new code required unless regressions are found

- [ ] **Step 1: Run the full quality gate**

```bash
npm run lint && npm test && npm run test:ui:run && npm run test:coverage:all
```

- [ ] **Step 2: Run the web app for manual QA**

```bash
npm run web
```

Manual QA checklist:

- Productos desktop layout looks distinct from mobile
- desktop columns obey 2-column / 3-column rule
- mobile remains one-column list
- stock and price visible everywhere
- create CTA works
- search works
- product navigation works
- no `import.meta` syntax error appears

- [ ] **Step 3: Capture proof artifacts**

Collect:

- one desktop screenshot/recording
- one mobile screenshot/recording
- one coverage summary output

Viewport rule for Expo web QA:

- `390px` for mobile validation
- `1024px` for desktop 2-column validation
- `1440px` for desktop 3-column validation

- [ ] **Step 4: Final commit if any polish/fixups were needed**

```bash
git add "app/(tabs)/productos/index.tsx" "components/products/ProductsToolbar.tsx" "components/products/ProductDesktopCard.tsx" "components/products/ProductMobileRow.tsx" "components/cards/card-products.tsx" "constants/typography.ts" "app/_layout.tsx" "components/ui/PerformanceMonitor.tsx" "components/ui/PerformanceReport.tsx" "lib/utils/profiler.ts" "vitest.config.ts" "vitest.ui.config.ts" "package.json" "scripts/coverage-total.mjs" "src/test/stores/theme-store.test.ts" "src/test/stores/onboarding-store.test.ts" "src/test/lib/logger.test.ts" "src/test/lib/feature-flags.test.ts" "src/test/lib/profiler.test.ts" "src/test/components/EmptyState.test.tsx" "src/test/components/ErrorBoundary.test.tsx" "src/test/components/ThemeToggle.test.tsx" "src/test/components/OfflineBanner.test.tsx" "src/test/components/SkipLink.test.tsx" "src/test/components/CircleIconButton.test.tsx" "src/test/components/ConfirmAlert.test.tsx" "src/test/components/AnimatedScreen.test.tsx" "src/test/components/ProductDesktopCard.test.tsx" "src/test/components/ProductMobileRow.test.tsx" "src/test/components/ProductsToolbar.test.tsx"
test -f "components/products/ProductStockBadge.tsx" && git add "components/products/ProductStockBadge.tsx" || true
test -f "src/test/stores/resumen-store.test.ts" && git add "src/test/stores/resumen-store.test.ts" || true
test -f docs/runtime/import-meta-root-cause.md && git add docs/runtime/import-meta-root-cause.md || true
git commit -m "chore(productos): finalize redesign, runtime fix, and coverage"
```

---

## Plan review notes

This plan is split into four chunks so each slice can be reviewed independently:

- Chunk 1: visual redesign
- Chunk 2: runtime root-cause fix
- Chunk 3: coverage work
- Chunk 4: verification

The executor should request chunk review after each chunk is completed.
