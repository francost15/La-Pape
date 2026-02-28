# Módulo Resumen — Contexto para Claude

## Arquitectura

La pantalla de resumen sigue el patrón **orquestador delgado + componentes especializados**:

```
app/(tabs)/resumen/index.tsx         ← solo coordina stores y pasa datos
  ├── store/resumen-store.ts         ← Zustand: listener real-time + selectores puros
  ├── store/filtros-store.ts         ← Zustand: período seleccionado
  ├── store/session-store.ts         ← Zustand: negocioId, userId, etc.
  ├── hooks/use-usuarios-map.ts      ← hook: resuelve nombres/fotos de vendedores
  └── lib/utils/format.ts            ← formatCurrency, formatDate, pluralize

components/resumen/
  ├── shared/
  │   ├── SectionCard.tsx            ← contenedor card reutilizable (bg, border, shadow)
  │   └── EmptyState.tsx             ← estado vacío reutilizable (ícono + texto)
  ├── KpiGrid.tsx                    ← 3 KPIs: Ventas, Ganancia, Devoluciones
  ├── CategoryBreakdown.tsx          ← Donut chart + leyenda con barras de progreso
  ├── VentasPorUsuario.tsx           ← Lista de vendedores con % de ventas y avatar
  ├── TopProductsList.tsx            ← Top 5 productos más vendidos
  └── ProductosBajoStockList.tsx     ← Productos con stock <= stock_minimo
```

## Patrones clave

- **Nunca definir `formatCurrency` inline** — siempre importar de `@/lib/utils/format`
- **`SectionCard`** reemplaza el patrón `bg-white rounded-xl p-4 border...` que se repetía en 5 archivos
- **`EmptyState`** reemplaza los `<View className="py-6 items-center"><Text>...</Text></View>` inline
- **`useUsuariosMap`** extrae la lógica de resolución de usuarios (antes duplicada en 2 useEffects en index.tsx)
- Los selectores puros (`selectMetricas`, etc.) viven en `store/resumen-store.ts` para ser testeables

## Stores de Zustand

| Store | Propósito |
|-------|-----------|
| `useResumenStore` | ventas real-time + detallesMap + loading/error |
| `useFiltrosStore` | período seleccionado + rango personalizado |
| `useProductosStore` | catálogo de productos + categorías |
| `useSessionStore` | sesión de usuario (negocioId, userId, etc.) |
| `useLayoutStore` | isMobile |

## UX/UI

- **KPI cards**: borde izquierdo de acento (no fondo completo), layout `flex-row flex-wrap` en mobile
- **CategoryBreakdown**: barras de progreso horizontales en la leyenda para comparación visual rápida
- **VentasPorUsuario**: barra de participación (% del total) debajo de cada vendedor, siempre en columna (nunca flex-row wrap)
- **Animaciones**: entrada escalonada (fade + slide up) en KPIs y filas de usuarios con Reanimated
- **TopProductsList / ProductosBajoStockList**: filas de lista plana con separador, SIN `CardProducts` — ese componente genérico queda fuera de lugar en el resumen. Usar `RankingRow` / `StockRow` propios, con imagen miniatura + nombre + stats al lado derecho

## Reglas del proyecto (.cursor/rules/)

- Tailwind para estilos, mobile-first
- TypeScript estricto (no `any` salvo `iconName as any` para SF Symbols)
- Zustand para estado global, `useMemo`/`useCallback` para datos derivados
- `React.memo` para componentes de lista costosos
- Comentarios: explicar el WHY, no el WHAT
