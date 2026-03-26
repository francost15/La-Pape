# La Pape Design System

Sistema de diseño unificado para la aplicación La Pape.

## Paleta de Colores

### Color Primario

- **Orange 500**: `#ea580c` - Acciones principales, CTAs, precios
- **Orange 400**: `#f97316` - Hover states
- **Orange 600**: `#c2410c` - Pressed states

### Colores Semánticos

| Propósito   | Color    | Hex       |
| ----------- | -------- | --------- |
| Éxito       | Verde    | `#22c55e` |
| Advertencia | Amarillo | `#eab308` |
| Error       | Rojo     | `#ef4444` |
| Info        | Azul     | `#3b82f6` |

### Escala de Grises

```
gray-50:  #f9fafb
gray-100: #f3f4f6
gray-200: #e5e7eb
gray-300: #d1d5db
gray-400: #9ca3af
gray-500: #6b7280
gray-600: #4b5563
gray-700: #374151
gray-800: #1f2937
gray-900: #111827
```

## Sistema de Espaciado

Base: **8px**

| Token | Valor | Uso                                 |
| ----- | ----- | ----------------------------------- |
| `xs`  | 4px   | Espaciado muy compacto              |
| `sm`  | 8px   | Elementos relacionados              |
| `md`  | 16px  | Default, separación entre secciones |
| `lg`  | 24px  | Separación notable                  |
| `xl`  | 32px  | Espaciado grande                    |
| `xxl` | 48px  | Espaciado hero                      |

## Tipografía

### Familia de Fuentes

- **Display**: AvenirNextCondensed-Heavy / Bebas Neue (web)
- **Heading**: AvenirNext-DemiBold / Nunito Sans (web)
- **Body**: AvenirNext-Regular / Nunito Sans (web)
- **Body Strong**: AvenirNext-Medium / Nunito Sans (web)

### Escala

- Títulos: 24-32px, fontWeight 700
- Subtítulos: 18-20px, fontWeight 600
- Cuerpo: 14-16px, fontWeight 400-500
- Labels: 12-13px, fontWeight 500

## Radio de Borde

| Token  | Valor  | Uso                      |
| ------ | ------ | ------------------------ |
| `sm`   | 8px    | Botones pequeños, inputs |
| `md`   | 12px   | Botones, cards pequeñas  |
| `lg`   | 16px   | Cards, modales           |
| `xl`   | 24px   | Paneles grandes          |
| `full` | 9999px | Pills, avatares          |

## Sombras

### Web (CSS)

```css
shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
shadow-md:  0 4px 6px rgba(0,0,0,0.07)
shadow-lg:  0 10px 15px rgba(0,0,0,0.1)
```

### Native (iOS/Android)

```typescript
shadow-sm:  elevation: 1, shadowOpacity: 0.05
shadow-md:  elevation: 3, shadowOpacity: 0.07
shadow-lg:  elevation: 5, shadowOpacity: 0.1
```

## Animaciones

### Duraciones

| Token    | Valor | Uso                    |
| -------- | ----- | ---------------------- |
| `fast`   | 150ms | Micro-interacciones    |
| `normal` | 250ms | Transiciones estándar  |
| `slow`   | 400ms | Animaciones de entrada |

### Easing

```typescript
default: 'cubic-bezier(0.4, 0, 0.2, 1)'  // Suave
bounce:  'cubic-bezier(0.34, 1.56, 0.64, 1)'  // Elástico
```

## Patrones de Componentes

### Card

```typescript
{
  borderRadius: radius.lg,  // 16px
  backgroundColor: 'white',
  ...shadows.md,
  padding: spacing.md,  // 16px
}
```

### Button Primary

```typescript
{
  backgroundColor: '#ea580c',
  borderRadius: radius.md,  // 12px
  paddingVertical: spacing.sm + 4,  // 12px
  paddingHorizontal: spacing.md,  // 16px
}
```

### Button Secondary

```typescript
{
  backgroundColor: 'transparent',
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: '#ea580c',
  paddingVertical: spacing.sm + 4,
  paddingHorizontal: spacing.md,
}
```

### Input

```typescript
{
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: '#e5e7eb',
  paddingVertical: spacing.sm + 4,
  paddingHorizontal: spacing.md,
}
// Focus state:
{
  borderColor: '#ea580c',
  ringWidth: 2,
  ringColor: 'rgba(234, 88, 12, 0.2)',
}
```

## Micro-Animaciones

### Hooks Disponibles

```typescript
// Escala para feedback de press
useScaleAnimation(trigger, scale);

// Shake para errores
useShakeAnimation();

// Pulse para notificaciones
usePulseAnimation();

// Bounce al agregar al carrito
useBounceAddAnimation();

// Fade out con delay opcional
useFadeOutAnimation();

// Staggered fade out para listas
useStaggeredFadeOut(itemCount);

// Success checkmark animation
useSuccessAnimation();
```

### Uso Común

**Agregar al carrito:**

```typescript
const { scale, bounceAdd } = useBounceAddAnimation();
// En handleAdd: bounceAdd()
```

**Decrementar a 0 (shake + disappear):**

```typescript
const { offset, shake } = useShakeAnimation();
const { opacity, fadeOut } = useFadeOutAnimation();
// En handleMinus si quantity === 1: shake() + fadeOut()
```

**Checkout success:**

```typescript
const { scale, opacity, playSuccess } = useSuccessAnimation();
// Al completar venta: playSuccess()
```
