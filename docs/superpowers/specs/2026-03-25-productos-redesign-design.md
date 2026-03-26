# Productos redesign + runtime fix + coverage strategy

## Context

The current `Productos` section lost visual quality and operational clarity after recent iterations. The product listing must support two intentionally different interfaces:

- **Desktop:** hybrid POS catalog with strong stock/price hierarchy
- **Mobile:** compact, fast-scanning list with image + price prominence

This redesign must also include:

- Investigation and fix for `Uncaught SyntaxError: import.meta may only appear in a module`
- Coverage improvements without destabilizing runtime or breaking web

Project constraints from repository guidance:

- Expo Router React Native app
- NativeWind styling
- `expo-image` for images
- Reanimated for animation work
- Distinct mobile and desktop layouts are expected and valid

Current branch note:

- Vitest is already configured in this working branch
- Existing tests currently live under `src/test/**`

## Goals

1. Restore a high-quality `Productos` experience on both desktop and mobile
2. Respect POS workflows over generic ecommerce aesthetics
3. Keep stock and price highly legible
4. Preserve fast browsing, search, and product creation actions
5. Fix the `import.meta` runtime issue at the root cause
6. Increase test coverage safely, without contaminating app runtime

## Non-goals

- Converting `Productos` into a pure dashboard/table layout
- Using the same card layout for mobile and desktop
- Introducing decorative typography that reduces operational clarity
- Shipping coverage tooling that leaks into production/web runtime

---

## Design direction

### Chosen direction

**Hybrid POS utilitarian**

This direction balances visual polish with inventory-first usability.

- Not a soft ecommerce gallery
- Not a dry admin table
- A polished operational catalog where **stock and price matter more than decoration**

### Responsive source of truth

`Productos` must keep a single explicit source of truth for layout mode:

- Use the existing responsive signal from the codebase: `useLayoutStore((s) => s.isMobile)`
- Treat `isMobile === true` as the mobile layout
- Treat `isMobile === false` as the desktop layout

Do not invent a second breakpoint system inside the screen.

Desktop sub-layout rule:

- Once `isMobile === false`, desktop column count may be derived from actual width using `useWindowDimensions()`
- Use **2 columns** for desktop widths `768-1279`
- Use **3 columns** for desktop widths `1280+`
- This width logic is only for desktop column density, not for choosing between mobile vs desktop layout

### Visual character

- Clean, structured, sharp
- Strong numeric hierarchy
- Restrained shadows
- Better spacing rhythm
- More deliberate card geometry
- Faster scanability than the current version

---

## Desktop design

### Screen structure

Desktop uses a **compact header + adaptive grid**.

#### Top header block

Contains:

- Section title
- Result count / inventory summary
- Search input
- Create product CTA

Desktop requirements:

- Header stays in a single horizontal row when space allows
- Search occupies the main flexible space
- CTA remains visually present without overpowering search
- Result count stays secondary but visible

Observable validation:

- In desktop mode, search and CTA render on the same header block
- Search remains usable without wrapping into a broken layout

Header should feel compact and operational, not oversized.

#### Grid below

- 2 columns for desktop widths from 768 to 1279
- 3 columns for desktop widths 1280 and above
- Consistent gutter spacing
- No oversized single-column “marketing” cards

Desktop grid requirements:

- Keep current pagination behavior working
- Preserve empty, loading, refresh, and error states
- Maintain fast scroll and stable card sizes

### Desktop product card

Card type: **hybrid card**

#### Upper area

- Product image in a contained, structured frame
- Image supports product recognition but does not dominate the card
- If image missing, fallback placeholder should still look intentional

Desktop image requirements:

- Image occupies the top visual block
- Image height is shorter than the current oversized gallery-style treatment
- Image should support recognition, not become the primary focus

#### Lower area

Primary hierarchy:

1. **Stock status**
2. **Sale price**
3. Product name
4. Brand / category / wholesale price

Desktop content requirements:

- Stock badge must be visible without opening the product
- Price must remain readable from a grid scan
- Product name max two lines
- Wholesale price is tertiary
- Brand/category stay secondary and visually quieter

Observable validation:

- Stock badge/value appears on every desktop card
- Sale price appears on every desktop card
- Product name truncates at two lines maximum
- Wholesale price uses smaller visual emphasis than sale price

#### Visual behavior

- Stock should use a visible status badge or pill
- Price should be large and high-contrast
- Name can span two lines max
- Secondary metadata stays quieter
- Card hover/press should feel precise, not playful

Interaction requirement:

- `hover` is web-only
- Native platforms use press feedback only
- No hover-only critical information

### Desktop interaction goals

- Easier to scan many products quickly
- Faster recognition of low stock and price
- Better separation between important and secondary information

---

## Mobile design

### Screen structure

Mobile uses a **compact list-first layout**.

- Search stays at top
- Create-product action remains visible and easy to reach
- The main content is a fast vertical list

Mobile requirements:

- No desktop grid reuse
- Mobile stays list-first
- The row must remain thumb-friendly and fast to scan

### Mobile product row

Mobile should not reuse the desktop card.

#### Layout

- Small-to-medium image on the left
- Product identity in the center
- Price + stock emphasis on the right

Mobile row requirements:

- Image is smaller than desktop and stays rectangular or softly rounded
- Right column must expose price immediately
- Stock must remain visible without pushing row height too far
- Row remains compact enough for rapid scrolling

Observable validation:

- Stock appears on every mobile row
- Sale price appears on every mobile row
- Row remains single-item, single-column and scrollable without layout jumps

#### Hierarchy

- Product name first
- Brand/category secondary
- Price strong and immediate
- Stock visible without making the row noisy

Mobile metadata requirements:

- Name max two lines
- Secondary metadata max one line
- Price remains visually stronger than metadata
- Stock state uses concise wording or compact badge

#### Tone

- Lighter than desktop cards
- Faster to scroll
- Better for thumb-driven use
- Minimal visual friction

### Mobile interaction goals

- Product list remains easy to scan in a single vertical pass
- Tappable product targets remain comfortable on mobile
- Product recognition is supported by image + name + price visibility in each row

---

## Typography recommendation

### Chosen typography tone

**Utilitarian POS clarity**

Typography should communicate speed, precision, and legibility.

### Recommendation

- Keep a condensed face only for **high-value numeric moments** like prices / strong counters
- Use a clean sans for product names, headers, secondary info, and UI controls
- Reduce theatrical display usage in product browsing surfaces

### Specific recommendation for this project

Keep the current general family strategy, but tighten usage:

- `display`: only for strong numeric emphasis when truly useful
- `heading`: section titles and important labels
- `bodyStrong`: product names, action labels
- `body`: metadata and secondary content

### Exact mapping by element

- Desktop product price: `display` or strongest available numeric emphasis
- Desktop stock badge: `heading` or `bodyStrong`, never decorative display
- Desktop product name: `bodyStrong`
- Desktop metadata: `body`
- Mobile product price: `heading` or `bodyStrong` depending density
- Mobile stock badge/text: `bodyStrong`
- Mobile product name: `bodyStrong`
- Mobile metadata: `body`

### Cross-platform compatibility rule

No typography choice in `Productos` may rely on a font that exists only on one platform unless the existing `AppFonts` fallback already covers it.

### Result

This keeps brand character while making `Productos` feel more operational and less decorative.

---

## Layout and spacing rules

### Shared principles

- More whitespace between major blocks
- Tighter whitespace inside metadata groups
- Stronger alignment of image / text / price areas
- Fewer accidental visual collisions

### Desktop

- Use consistent grid spacing
- Use clearer vertical rhythm inside the card
- Keep CTA area stable and non-jumpy

### Mobile

- Rows should feel compact, not cramped
- Reduce shadow usage
- Prefer separators / subtle surfaces over heavy card chrome

---

## States

### Loading

- Must match each layout style
- Desktop: skeleton cards or structured placeholders
- Mobile: row-like placeholders

State-preservation rule:

- Redesign must not regress current loading, retry, refresh, pagination, or empty behaviors.

### Empty

- Keep consistent with app-wide empty-state system
- But make the `Productos` empty experience actionable with a strong “create first product” path

### Error

- Retry must remain obvious
- Error state should not break layout identity

---

## Animations and motion

Motion should support clarity, not spectacle.

- Hover/press: short, precise
- Card appearance: subtle stagger or fade-up only if it does not slow scanability
- Avoid excessive bounce in the product browsing surface

---

## Root-cause strategy for `import.meta` runtime error

### Problem statement

`Uncaught SyntaxError: import.meta may only appear in a module`

This strongly suggests a file intended for module execution is being interpreted in a non-module context, or a tooling artifact is leaking into runtime.

### Bounded implementation scope

The investigation/fix slice is limited to these likely targets first:

- `app/_layout.tsx`
- `app/(tabs)/productos/index.tsx`
- `components/ui/PerformanceMonitor.tsx`
- `components/ui/PerformanceReport.tsx`
- `lib/utils/profiler.ts`
- `scripts/benchmark.ts`
- `vitest.config.ts`
- `package.json` scripts that may inject tooling into web runtime

Only expand beyond this set if the reproduction evidence proves the failing import chain leaves this boundary.

### Investigation approach

1. Reproduce the error on web
2. Identify exact file and stack/source location
3. Check recent additions around:
   - benchmark scripts
   - coverage tooling
   - detox config
   - any browser-loaded helper using Node/Vite assumptions
4. Verify whether a file using `import.meta` is being bundled into app runtime instead of remaining dev/tooling-only
5. Check indirect sources too:
   - Expo web bundling output
   - Vitest-related config leakage
   - NativeWind/PostCSS/web config boundaries
   - any third-party dependency or generated artifact introducing `import.meta`

### Likely design-safe fix direction

- Isolate tool-only files away from runtime imports
- Keep benchmark / coverage / profiling files out of UI import chains
- If needed, rewrite the offending usage to a platform-safe alternative

### Evidence required before fix is accepted

- Exact failing file or compiled source identified
- Import chain documented
- Root cause isolated to runtime code vs tooling-only code
- Web verified after fix with no `import.meta` syntax error

Required closure evidence:

- Exact reproduction command documented
- Environment documented (`web`, route/screen, and when it fails)
- Exact asset/file or compiled source causing failure documented
- Chain of imports documented
- Applied fix documented
- Final web run verified with the error absent

### Non-goal

- No hacky “just suppress it” fix
- Must resolve the actual import path / runtime boundary issue

---

## Coverage strategy

### Goal

Increase coverage meaningfully without breaking production or web runtime.

### Baseline and target

- Current overall coverage baseline is approximately **36%**
- Safe target for this slice is **50%+ overall coverage**
- Any move beyond that must not require unstable runtime/tooling hacks in the main app bundle

Measurement rule:

- Measure baseline and target with `npm run test:coverage`
- Read overall line coverage from the generated coverage summary output/artifact
- Acceptance is reached when the reported overall line coverage is **50% or higher**

### Principles

- Prefer store, utility, validation, and hook coverage first
- Expand component coverage only with reliable test setup
- Keep test infrastructure isolated from app runtime
- Avoid introducing module/runtime mismatches for the sake of coverage

### Safe scope boundary

Phase 1 coverage work should prioritize only:

- `store/*.ts`
- `lib/utils/*.ts`
- `lib/validations/*.ts`
- pure hooks that do not require unstable RN UI environment hacks

Component tests are phase 2 only, and only if test environment separation is explicit and stable.

### Execution direction

1. Measure current uncovered domains
2. Prioritize logic-heavy files with low risk
3. If component tests are added, separate or explicitly validate the environment (`node` vs `jsdom`) instead of mixing assumptions into one fragile setup
4. Keep coverage files and configs out of runtime bundles

### Success definition

- Coverage increases without introducing runtime regressions
- Web app boots cleanly
- `npm run lint` and `npm test` remain green in this branch where Vitest is already configured

Observable coverage safety checks:

- No runtime file imports benchmark, test, or coverage-only modules
- Test configuration explicitly declares suite environment (`node` or `jsdom`) when needed
- Web still starts after coverage-related config changes

---

## Files expected to change

### Design/UI

- `app/(tabs)/productos/index.tsx`
- `components/cards/card-products.tsx`
- potentially `components/search/SearchProducts.tsx`
- potentially `constants/typography.ts`
- possibly new product card/list subcomponents if needed to keep files small

### Debug/runtime boundary

- whichever runtime/tooling file is proven to cause the `import.meta` issue
- possibly profiling/coverage related config if incorrectly wired into runtime
- possible config review targets: package scripts, vitest config, profiling helpers, benchmark script entrypoints, any web-only config touched by recent changes

### Coverage

- test files under `src/test/**`
- vitest config only if required and safe
- no app runtime file should import test-only or benchmark-only modules

---

## Success criteria

### Productos UI

- Desktop and mobile use intentionally different layouts driven by `isMobile`
- Desktop shows a multi-column hybrid grid with stock and price visually stronger than secondary metadata
- Mobile shows a compact single-column list optimized for fast scan and thumb use
- Product name is capped to two lines in both layouts
- Stock is visible on every product card/row without opening detail
- Price is immediately visible on every product card/row without opening detail
- Search, create CTA, pagination, loading, refresh, error, and empty states still work
- Typography mapping follows the explicit element rules in this spec

Concrete acceptance checks:

- Desktop: every visible card shows image, product name, sale price, and stock state
- Desktop: sale price has stronger visual emphasis than wholesale price and metadata
- Mobile: every visible row shows image, product name, sale price, and stock state
- Mobile: product list remains one column only
- Both layouts: tapping a product still opens product detail

Required UI verification evidence:

- One desktop screenshot or recording of `Productos`
- One mobile screenshot or recording of `Productos`
- Manual verification checklist confirming: search works, create CTA works, empty state works, loading state works, and product detail navigation still works

### Runtime

- `import.meta` error is gone at the root cause
- Web loads without that syntax failure
- Root cause source file or import chain is identified and documented before the fix is considered done

### Quality

- `npm run lint` passes
- `npm test` passes
- Coverage increases without runtime breakage
- No runtime/test/tooling leakage introduced by coverage or profiling changes

---

## Implementation recommendation

Deliver in three implementation slices:

1. **Productos redesign**
2. **Runtime error root-cause fix**
3. **Coverage expansion**

This keeps visual work, debugging work, and test-infra work from interfering with one another.
