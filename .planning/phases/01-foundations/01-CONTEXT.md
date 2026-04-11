# Phase 1: Foundations - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Hacer la plataforma segura y observable: hardening de Firestore security rules con aislamiento multi-tenant y roles, migración del test runner a jest-expo, instalación y configuración de Sentry con error boundaries granulares, y compatibilidad con @gorhom/bottom-sheet.

No se agregan funcionalidades de usuario en esta fase — es infraestructura que hace seguras las fases siguientes.

</domain>

<decisions>
## Implementation Decisions

### Firestore Security Rules — Aislamiento

- Aislamiento total por `negocio_id`: un usuario autenticado en negocio A no puede leer NI escribir datos de negocio B
- Colecciones a hardener: `productos`, `categorias`, `ventas`, `ventas-detalle`, `ventas-pagos`, `inventario-movimientos`
- El campo `negocio_id` en cada documento es la clave del aislamiento

### Roles — Definición

- Dos roles: `admin` y `cajero`
- El rol vive en `usuarios-negocios` (campo `rol: 'admin' | 'cajero'`) — esta colección ya existe
- `useSessionStore` lo carga al hacer hydrate y lo expone en toda la app
- Claude decide si usar custom claims de Firebase Auth para las Firestore rules (o solo `usuarios-negocios`) según lo que sea más práctico dado que no hay Firebase Functions configuradas

### Roles — Acceso a pantallas

- Cajero tiene acceso EXCLUSIVAMENTE a: ver lista de productos (precios) y realizar ventas (pantalla Ventas)
- Cajero NO puede acceder a: crear/editar/eliminar productos, pantalla Resumen/analytics, pantalla Configuración, historial de ventas de otros cajeros
- Cuando un cajero intenta acceder a pantalla restringida: mostrar pantalla con mensaje "Sin permiso" (no redirect silencioso)

### Test Runner — Migración

- Migrar de Vitest a jest-expo (standard oficial de Expo, mejor soporte para módulos nativos)
- Los ~20 tests existentes en `src/test/` deben migrarse a la nueva configuración
- Prioridades de tests en esta fase: smoke test (que la app renderiza sin crashear) + tests de stores Zustand

### Sentry — Integración

- Instalar `@sentry/react-native` y configurar para Expo
- Claude decide la estrategia de DSN (env vars o app.config.js, lo más apropiado para Expo)
- Error boundaries granulares en: cada tab principal (Ventas, Productos, Historial, Resumen) + componentes críticos de ventas (CartPanel, ProductListContent)
- Root ErrorBoundary ya existe — no reemplazar, complementar con los granulares

### Claude's Discretion

- Estrategia exacta de custom claims (si se implementan) vs verificación via `get()` en rules
- Configuración específica del DSN de Sentry (env vars, app.config.js, o sentry.properties)
- Approach de instalación de @gorhom/bottom-sheet — el codebase ya tiene una implementación custom con Reanimated; Claude decide si coexisten o si se migra
- Estructura de archivos para los tests migrados

</decisions>

<code_context>

## Existing Code Insights

### Reusable Assets

- `components/ui/ErrorBoundary.tsx`: ErrorBoundary de clase ya implementado con UI de error y botón "Reintentar". Reutilizar como base para los boundaries granulares de tabs.
- `store/session-store.ts`: `useSessionStore` ya tiene hydrate() que carga `negocioId`/`sucursalId`. Agregar `rol` aquí es el punto natural de integración.
- `firestore.rules`: Archivo ya existe y compilado — hardening in-place, no desde cero.

### Established Patterns

- Zustand para todo el estado global — el rol del usuario debe vivir en `useSessionStore`, no en Context
- NativeWind para styling — el componente de "Sin permiso" debe usar `className`, no StyleSheet
- `lib/services/<domain>/` para toda lógica Firestore — las queries de rol/permisos van ahí
- Reanimated + Gesture Handler ya instalados y funcionando (AddProductsSheet los usa)

### Integration Points

- `useSessionStore.hydrate(user)` → agregar carga del rol desde `usuarios-negocios`
- `app/(tabs)/_layout.tsx` → punto de aplicación de role guards para tabs
- `app/_layout.tsx` → ya wrappea con `<ErrorBoundary>` — los boundaries de tabs van en `app/(tabs)/_layout.tsx` o en cada `app/(tabs)/<tab>/_layout.tsx`
- `firestore.rules` → reescribir rules con funciones de tenant isolation

</code_context>

<specifics>
## Specific Ideas

- "El cajero solo va a tener acceso a ver precios y a vender y ya" — minimalismo de permisos, sin excepciones
- La pantalla "Sin permiso" debe ser clara y no confundir al cajero — un mensaje simple tipo "No tienes acceso a esta sección"
- El aislamiento debe ser real en Firestore rules (no solo UI) — seguridad en profundidad

</specifics>

<deferred>
## Deferred Ideas

- Ninguna idea extra surgió fuera del scope de Phase 1

</deferred>

---

_Phase: 01-foundations_
_Context gathered: 2026-04-11_
