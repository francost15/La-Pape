# La Pape Design System — "Digital Atelier"

Sistema de diseño unificado para la aplicación La Pape.
Fuentes de verdad en código: `constants/colors.ts` (AppColors), `constants/typography.ts` (AppFonts), `constants/design-system.ts` (DesignSystem), `app/global.css` (CSS vars web/native) y `tailwind.config.ts` (tokens semánticos).

## Paleta de Colores

### Acento (naranja de marca)

- **Primary**: `#ea580c` — CTAs, precios, acciones principales (light)
- **Primary Light**: `#f97316` — acento en dark mode / hover
- **Primary Dark**: `#c2410c` — pressed states
- **Primary Ghost**: `rgba(234,88,12,0.08)` light / `rgba(249,115,22,0.12)` dark — fondos suaves de acento

### Colores Semánticos

| Propósito   | Light     | Dark      |
| ----------- | --------- | --------- |
| Éxito       | `#16a34a` | `#22c55e` |
| Advertencia | `#eab308` | `#eab308` |
| Error       | `#dc2626` | `#ef4444` |
| Info        | `#2563eb` | `#3b82f6` |

### Superficies y Texto (AppColors.light / AppColors.dark)

| Rol             | Light              | Dark                     |
| --------------- | ------------------ | ------------------------ |
| canvas          | `#FAFAF9`          | `#0C0F14` (navy)         |
| surface         | `#FFFFFF`          | `#141820`                |
| surfaceElevated | `#FFFFFF`          | `#1A1F2B`                |
| surfaceHover    | `#F5F5F4`          | `#1E2433`                |
| border          | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.06)` |
| borderStrong    | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.12)` |
| textPrimary     | `#1A1A1A`          | `#F0F0F0`                |
| textSecondary   | `#6B7280`          | `#8B95A5`                |
| textMuted       | `#9CA3AF`          | `#5A6478`                |
| textLabel (AA)  | `#6B7280`          | `#8B95A5`                |

`textLabel` es el tono muted que **sí** cumple WCAG AA (4.5:1); `textMuted` queda solo para adornos decorativos.

En componentes, obtener el tema con el hook:

```ts
const { isDark, colors } = useThemeColors(); // colors.textPrimary, colors.surface…
```

## Tokens Tailwind (`tailwind.config.ts`)

Tokens semánticos mapeados a las CSS variables de `app/global.css` (con valores light y dark, así que **no requieren variante `dark:`**):

| Clase                                                              | Rol               |
| ------------------------------------------------------------------ | ----------------- |
| `bg-canvas`                                                        | fondo de pantalla |
| `bg-surface` / `bg-surface-elevated` / `bg-surface-hover`          | superficies       |
| `border-line` / `border-line-strong`                               | bordes            |
| `text-content-primary` / `-secondary` / `-muted` / `-label`        | texto             |
| `bg-accent` / `text-accent` / `bg-accent-soft` / `accent-hover`    | naranja de marca  |
| `text-success` / `text-error` / `text-warning` / `text-info`       | semánticos        |
| `font-display` / `font-heading` / `font-body` / `font-body-strong` | familias          |

> ⚠️ **Activación pendiente**: Tailwind v4 es CSS-first y no carga `tailwind.config.ts` automáticamente. Estas clases se activan añadiendo `@config "../tailwind.config.ts";` en `app/global.css` (planificado para la ola de migración de pantallas). Hasta entonces, usar las primitivas de `components/ui/` (que resuelven tema vía JS) o el patrón existente de `dark:`.

## Tipografía

### Familia de Fuentes

- **Display / Heading**: Space Grotesk (native: `SpaceGrotesk_700Bold` / `SpaceGrotesk_600SemiBold` vía expo-font; web: CSS `"Space Grotesk"`)
- **Body / Body Strong**: Inter (native: `Inter_400Regular` / `Inter_500Medium`; web: CSS `"Inter"`)

Importar siempre desde `constants/typography.ts` (`AppFonts.display`, `AppFonts.body`, …). En native el peso va codificado en el nombre del archivo — **no** añadir `fontWeight` junto a `AppFonts.*` en native (puede forzar fallback en Android); en web sí es necesario.

### Escala canónica (`components/ui/AppText.tsx`)

| Variant      | Familia                | Tamaño/Línea | Tracking        | Color default | Uso                               |
| ------------ | ---------------------- | ------------ | --------------- | ------------- | --------------------------------- |
| `display`    | Space Grotesk Bold     | 32/38        | -0.5            | textPrimary   | KPIs, precios grandes             |
| `heading`    | Space Grotesk SemiBold | 22/28        | -0.4            | textPrimary   | títulos de pantalla/sección       |
| `subheading` | Space Grotesk SemiBold | 17/22        | -0.3            | textPrimary   | títulos de card, headers de sheet |
| `body`       | Inter Regular          | 15/22        | 0               | textPrimary   | texto de lectura                  |
| `bodyStrong` | Inter Medium           | 15/22        | -0.2            | textPrimary   | botones, énfasis                  |
| `label`      | Inter Medium           | 13/18        | 0               | textSecondary | labels de formularios/listas      |
| `eyebrow`    | Inter Bold             | 10/14        | +1.6, UPPERCASE | textLabel     | kickers ("TOTAL A PAGAR")         |
| `caption`    | Inter Regular          | 12/16        | 0               | textMuted     | metadatos, notas                  |

```tsx
import AppText from "@/components/ui/AppText";

<AppText variant="eyebrow">Total a pagar</AppText>
<AppText variant="display" color={AppColors.primary}>{formatCurrency(total)}</AppText>
<AppText variant="body">Descripción del producto…</AppText>
```

## Espaciado, Radios, Sombras, Animaciones (`DesignSystem`)

Base de espaciado **8px**: `xs 4 / sm 8 / md 16 / lg 24 / xl 32 / xxl 48`.

Radios: `sm 8 / md 12 / lg 16 / xl 20 / xxl 28 / full 9999`.

Sombras (`DesignSystem.shadows`, con branch web/native ya resuelto):

```
sm: 0 1px 2px rgba(0,0,0,0.04)   · elevation 1
md: 0 2px 8px rgba(0,0,0,0.06)   · elevation 3
lg: 0 8px 24px rgba(0,0,0,0.08)  · elevation 5
glow: 0 0 20px rgba(234,88,12,0.15)
```

Duraciones: `fast 150 / normal 250 / slow 400 / entrance 500`.
Easing: `default cubic-bezier(0.4,0,0.2,1)`, `bounce cubic-bezier(0.34,1.56,0.64,1)`, `strongOut cubic-bezier(0.23,1,0.32,1)` (Reanimated: `DesignSystem.easingCurve.strongOut`).

## Primitivas UI (`components/ui/`)

### Button

Variantes `primary` (naranja), `secondary` (superficie + borde), `ghost` (texto naranja), `destructive` (rojo). Tamaños `sm/md/lg` (touch target ≥ 44 garantizado vía minHeight + hitSlop). Incluye haptics (guardados con `Platform.OS !== "web"`), press-scale (respeta reduced motion), spinner de `loading`, y accesibilidad (`accessibilityRole/Label/State`).

```tsx
import Button from "@/components/ui/Button";

<Button title="Completar venta" onPress={handleComplete} loading={processing} />
<Button title="Cancelar" variant="secondary" onPress={onCancel} />
<Button title="Eliminar" variant="destructive" size="sm" fullWidth={false} onPress={onDelete} />
```

### AppTextInput

Input canónico: superficie del tema, radio 14, borde 1.5 (naranja en focus, rojo con error), placeholder desde tokens. RHF-friendly:

```tsx
import AppTextInput from "@/components/ui/AppTextInput";

<Controller
  control={control}
  name="nombre"
  render={({ field: { onChange, onBlur, value } }) => (
    <AppTextInput
      label="Nombre del Producto *"
      placeholder="Ej: Lápiz HB #2"
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      error={errors.nombre?.message}
    />
  )}
/>;
```

### SectionCard

Contenedor flat de sección (sin borde ni sombra — estilo Digital Atelier). Vive en `components/ui/SectionCard.tsx`; `components/resumen/shared/SectionCard.tsx` es un re-export de compatibilidad.

## Micro-Animaciones

Hooks/utilidades reales disponibles:

```ts
usePressScale(reduceMotion, pressedScale?)   // hooks/use-press-scale — feedback de escala en press
usePressScaleHandlers(reduceMotion)          // idem para SharedValue externo
useReducedMotion()                           // hooks/use-reduced-motion — preferencia del sistema
useHaptic(style?)                            // hooks/use-haptic — impacto háptico con guard web
```

Utilidades por dominio en `lib/animations/` (`press-scale.ts`, `cart-panel.ts`, `add-products-sheet.ts`, `circle-icon-button.ts`, `sliding-indicator.ts`).

Convención reduced-motion: conservar transiciones de opacidad/color, eliminar transforms de posición/escala.
