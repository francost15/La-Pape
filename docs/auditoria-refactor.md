# Auditoría integral — La Pape (2026-07-12)

Auditoría sobre la rama `refactor/cleanup-checkpoint`, generada con 5 análisis paralelos: bugs/correctness, rendimiento, duplicación de componentes/hooks, sistema de tipos (`interface/`) y código muerto. Cada hallazgo fue verificado leyendo el código real.

**Resumen ejecutivo:**

- **2 bugs críticos**: los reembolsos con 2+ productos distintos fallan siempre (transacción de Firestore mal ordenada), y las reglas de Firestore no aíslan tenants (cualquier usuario autenticado lee/escribe datos de todos los negocios).
- **1 bug alto de UX**: la sesión no persiste en iOS/Android (falta `initializeAuth` con AsyncStorage) — login en cada arranque.
- **Rendimiento**: el catálogo completo se re-descarga en cada apertura del sheet de ventas; los selectores de resumen son O(ventas×productos); varios `renderItem` inline anulan los `React.memo`.
- **Duplicación**: 16 grupos consolidables (~1.500 líneas de ahorro), destacando fila de producto duplicada, 6 copias de "imagen con fallback", 4 bottom-sheets calcados y 15+ ternarios de sombra web/native.
- **Tipos**: la "línea de venta" está definida 3 veces idéntica; ~20 tipos muertos incluida la carpeta `interface/clientes/` completa; 10 usos de `any` (solo 1 justificado).
- **Código muerto**: 8 archivos huérfanos seguros de borrar, 4-7 dependencias sin usar, script `reset-project` roto en package.json.

---

## 1. BUGS — Críticos

### B1. `refundVentaFlow` viola "reads before writes" → reembolsos con 2+ productos fallan SIEMPRE

`lib/services/ventas/refund-venta.ts:52-63`. Dentro de `runTransaction`, el loop intercala `transaction.get(productRef)` y `transaction.update(productRef)` por cada detalle. El SDK web exige todas las lecturas antes de la primera escritura: en la 2ª iteración lanza `"Firestore transactions require all reads to be executed before all writes"`. Solo funcionan reembolsos de un único producto.
**Fix:** primera pasada solo de `get` (venta + todos los productos), segunda de `update`/`set` — como ya hace `complete-venta.ts`. Además, los `detalles` se leen fuera de la transacción (línea 34): moverlos adentro para que la reposición de stock sea atómica.

### B2. Reglas de Firestore sin aislamiento multi-tenant y con colecciones sin reglas

`firestore.rules`:

- Todo es `isAuthenticated()`: cualquier usuario autenticado de cualquier negocio puede leer/escribir productos, ventas, detalles, pagos y movimientos de TODOS los negocios. El `where negocio_id ==` es solo cliente.
- `productos: allow update: if isAuthenticated()` (línea 28) anula las validaciones del `allow write` anterior.
- `usuarios_negocios`, `sucursales`, `negocios` y `clientes` no tienen regla → caen en `allow read, write: if false`. Con estas reglas desplegadas, `hydrate()` nunca resolvería negocio y la app sería inutilizable — si producción funciona, las reglas desplegadas no son estas (el archivo del repo está roto igual).
- `usuarios` solo permite leer el propio uid, pero la app lee docs de otros vendedores (`hooks/use-usuarios-map.ts:45`, `store/equipo-store.ts:27`) y hace queries por email (`lib/services/usuarios/index.ts:69-73`).
  **Fix:** reglas por tenant (validar `negocio_id` contra la relación `usuarios_negocios` del `request.auth.uid`), y añadir reglas explícitas a las 4 colecciones huérfanas.

## 1.1 BUGS — Altos

### B3. Sesión no persistente en iOS/Android

`lib/firebase.ts:19`. `getAuth(app)` en React Native usa persistencia en memoria (el comentario "la persistencia es automática en RN" es falso para el SDK JS v12). No hay `initializeAuth` en el repo; `@react-native-async-storage/async-storage` sí está instalado.
**Fix:** en native, `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })`; en web, `getAuth`. Aplica también a `lib/firebase-secondary.ts`.

### B4. Race en el listener compartido de ventas: snapshots fuera de orden

`lib/services/ventas/ventas-listener.ts:50-68`. El callback de `onSnapshot` es `async` y hace `await fetchDetalles` antes de `onData`: si llega un snapshot B mientras A está en vuelo, `onData(A)` puede ejecutarse después de `onData(B)` y la UI retrocede a una lista vieja. Además el `retryTimer` (2 s) re-emite la lista congelada de su snapshot, pisando snapshots más nuevos.
**Fix:** numerar snapshots y descartar emisiones de generaciones viejas; el retry debe re-emitir solo el cache de detalles, no reemplazar la lista de ventas.

## 1.2 BUGS — Medios

### B5. Race en `hydrate()` de sesión

`store/session-store.ts:26-74, 93-101`. `hydrate` hace 3-4 round-trips sin cancelación: un logout durante la hidratación deja estado fantasma (el `set` final re-puebla el store del usuario ya deslogueado). **Fix:** token de generación (`const myGen = ++gen`) y descartar `set` si `gen !== myGen`.

### B6. `sucursal_id: ""` escrito en ventas y movimientos

`hooks/use-complete-venta.ts:45` (`sucursalId ?? ""`), `hooks/use-history.ts:78`. Si el negocio no tiene sucursales, se crean ventas/movimientos con `sucursal_id: ""` y reembolsos con `usuario_id: ""` — datos corruptos silenciosos. **Fix:** bloquear la venta con mensaje claro u omitir el campo.

### B7. Stock local optimista sin validación en el carrito

`hooks/use-complete-venta.ts:52-57`, `store/ventas-store.ts:7-25`. El stock local se ajusta a mano tras vender/reembolsar pero no hay listener de productos, y el carrito permite agregar sin tope de stock — el vendedor descubre el problema recién al confirmar. **Fix:** validar `quantity <= product.cantidad` al agregar/incrementar.

### B8. Búsquedas por email sin normalizar mayúsculas

`lib/services/usuarios/index.ts:66-72`, `lib/services/usuarios-negocios/index.ts:111-113`. Los docs guardan `email.toLowerCase()` pero las queries usan el email tal cual viene de Auth → "No tienes un negocio asignado" para usuarios válidos con mayúsculas en el email. **Fix:** `email.trim().toLowerCase()` en todas las queries.

### B9. `createUserWithAuthAndLink` no atómico → cuentas Auth huérfanas

`lib/services/usuarios/index.ts:32-64`. Si `setDoc` o `createUsuarioNegocio` fallan tras crear la cuenta Auth, el email queda bloqueado (`auth/email-already-in-use`). **Fix:** Cloud Function de alta, o rollback (`cred.user.delete()`) en catch.

### B10. Doble escaneo QR posible

`components/ventas/QrScannerSheet.tsx:69-80`. El `finally` resetea `scannedRef.current = false` antes de que el modal termine de desmontar → `CameraView` puede disparar otro escaneo y duplicar el producto. **Fix:** no resetear el guard en éxito (ya lo resetea el efecto de `visible`).

### B11. `updateRol`/`removeMiembro` sin manejo de errores

`store/equipo-store.ts:64-76`. Ambas acciones `await` servicios que lanzan, sin try/catch → unhandled rejection y sin feedback al usuario. Además `updateRol` guarda el rol en el doc global `usuarios`, no en la relación `usuarios_negocios` (contradice el modelo multi-tenant declarado).

## 1.3 BUGS — Bajos

- **B12.** Retry del listener emite doble con el mismo snapshot; si Firestore no replicó detalles al 2º intento, la venta queda sin detalles hasta el próximo snapshot (`ventas-listener.ts:59-68`).
- **B13.** Inyección de HTML en el recibo PDF: `<td>${item.nombre}</td>` sin escape + `document.write(html)` en web (`lib/pdf/recibo-template.ts:227`, `lib/pdf/generate-recibo.ts:12`). Escapar `nombre` y `ventaId`.
- **B14.** `reset()` de feature-flags asigna la referencia compartida `DEFAULT_FLAGS` y un `setFlag` posterior la muta (`lib/services/feature-flags.ts:52`). Nota: el archivo entero está muerto — ver §5.
- **B15.** `Promise.all(...).then(...)` sin `.catch` en `hooks/use-usuarios-map.ts:99-103` → unhandled rejection y refetch sin backoff.
- **B16.** El rango de fechas del listener se congela al cruzar medianoche/mes en sesiones always-on (`store/ventas-data-store.ts:42-43`).
- **B17.** Timers sin limpieza al desmontar: `use-complete-venta.ts:61-95` (setTimeout 800 ms), `CartPanel.tsx:94-99`, `toast-store.ts:18`.
- **B18.** `result.total.toLocaleString()` en vez de `formatCurrency` es-CL (`use-complete-venta.ts:82`) → formato de moneda inconsistente.
- **B19.** `selectMetricas` calcula ganancia con el `costo_promedio` actual, no el histórico: editar un costo cambia retroactivamente la ganancia de períodos pasados (`store/resumen-store.ts:67-73`). Fix de fondo: persistir `costo_unitario` en `ventas_detalle` al vender.

**Verificado y correcto:** `complete-venta.ts` (transacción bien ordenada, valida stock), todos los `onSnapshot` tienen unsubscribe con ref-counting, queries acotadas por fecha o `limit(200)`, guard de doble submit del checkout efectivo, `useDebounce` y listeners de teclado con cleanup.

---

## 2. RENDIMIENTO

### Impacto alto

**P1. Refetch completo del catálogo en cada montaje — incluida cada apertura del sheet de ventas.** `hooks/use-productos-screen.ts:47-57` llama `loadData` incondicionalmente. Lo usan `app/(tabs)/productos/index.tsx:33` y `components/ventas/ProductListContent.tsx:39`; `AddProductsSheet.tsx:111` monta/desmonta el contenido en cada apertura → cada venta dispara `getNegocioIdByUsuario` + TODOS los productos + TODAS las categorías, con flash de skeleton sobre datos ya cacheados. Es el flujo más caliente del POS.
**Fix:** guard como el de `use-resumen.ts:57` (`if (products.length > 0) return` + revalidación en background), o listener compartido con ref-counting como `ventas-data-store.ts`.

**P2. Selectores O(V×P) en resumen.** `store/resumen-store.ts:69,101,137`: `products.find(...)` por cada detalle de venta, en 3 selectores, recalculado en cada snapshot y cambio de período. Con 500 productos y 1.000 detalles son ~1.5M comparaciones. Los 3 además repiten `filter(estado === "PAGADA")` + `getDetallesForVentas`.
**Fix:** `const productsById = new Map(...)` memoizada en `use-resumen` y pasada a los selectores; compartir `pagadas`/`detallesFiltrados` en un `useMemo` upstream.

**P3. `renderItem` inline anula `React.memo` en el catálogo de ventas.** `components/ventas/ProductListContent.tsx:179-192`: arrow inline + `onProductAdded={() => ...}` nuevo por render → cada tecla de búsqueda re-renderiza todas las filas visibles. **Fix:** `useCallback` + callback estable que reciba el nombre como argumento. Bonus: migrar esta única `FlatList` grande a FlashList.

**P4. Expandir una card del historial re-renderiza todas las `VentaCard`.** `app/(tabs)/history/index.tsx:81-98`: `renderVentaItem` depende de `expandedIds` y crea `onToggle` inline. **Fix:** pasar `onToggle(id)` estable + `expandido` como prop primitiva.

**P5. Stores Zustand consumidos sin selector.** `use-product-search.ts:12`, `use-productos-screen.ts:12-22`, `use-producto-detail.ts:18-27`, `use-edit-product.ts:40`, `CampoMarca.tsx:8`, `OnboardingHint.tsx:24,95-96` — re-render en cualquier cambio del store (abrir un detalle re-renderiza el listado Y el catálogo de ventas). **Fix:** selectores atómicos o `useShallow`.

### Impacto medio

**P6. N+1 de usuarios en resumen + refetch doble.** `hooks/use-usuarios-map.ts:69-108`: `getUsuarioById` por cada usuario del equipo, y `resolveUsuario` cambia de identidad cuando llegan `displayName`/`photoURL` → se re-descarga todo el equipo. **Fix:** query batched `where(documentId(), "in", chunk)` (mismo patrón de `getDetallesByVentaIds`).

**P7. `getProductsByNegocio` sin `limit` ni paginación de servidor.** `lib/services/productos/index.ts:92-108`: descarga el catálogo completo; la "paginación" de productos es un `slice` cosmético. Combinado con P1, el catálogo se paga muchas veces por sesión.

**P8. `CartItemRow` sin `React.memo`.** `components/ventas/cart/CartItemRow.tsx:10`: los props ya son estables; solo falta el memo para que +/− no re-renderice todas las filas.

**P9. `detallesMap` nuevo en cada snapshot.** `ventas-listener.ts:63,68` (`onData(ventas, { ...cache })`): invalida todos los `useMemo` downstream (agrupación de history, métricas, ranking) aunque nada cambiara. **Fix:** devolver la misma referencia cuando `idsToFetch.length === 0`.

**P10. Thumbnails a resolución original en listas recicladas.** `ProductThumb.tsx:23`, `ProductCardMobile.tsx:60-65`, `ProductItemVenta.tsx:65-70`, `CartItemRow.tsx:34-38`, `TopProductsList.tsx:42-47`: fotos full-res decodificadas para contenedores de 36-64px y sin `recyclingKey` en FlashList. **Fix:** `recyclingKey={product.id}` + thumbnails reducidos al subir.

**P11. `hydrate` con hasta 5 round-trips secuenciales** antes de `ready: true`, que bloquea el render de todas las tabs (`store/session-store.ts:34-69`). **Fix:** `Promise.all` de lo independiente tras obtener `negocioId`.

### Impacto bajo

- **P12.** Trabajo triplicado dentro de los selectores de resumen (se resuelve con P2).
- **P13.** DonutChart O(n²) en `CategoryBreakdown.tsx:34` (irrelevante con ≤8 categorías).
- **P14.** `getItemCount()`/`getTotal()` dentro del selector (`ventas/index.tsx:65`, `CartPanel.tsx:39`) — aceptable, vigilar.
- **P15.** `JSON.stringify(product)` como route param (`card-products.tsx:33`, `TopProductsList.tsx:24`) — mejor pasar solo `id` y leer del store.
- **P16.** `SearchProducts` dentro del header de la FlashList de productos: cada tecla recrea el header (`productos/index.tsx:116-174`).
- **P17.** `useKeyboardShortcuts` con deps volátiles (`ventas/index.tsx:81-105`) — leer `getItemCount` vía `getState()`.
- **P18.** `use-producto-detail.ts:56-63` refetch de fondo en cada focus aun con cache hit — considerar TTL.

**Lo que ya está bien (no tocar):** listener compartido de ventas con ref-counting, fetch de detalles por lotes `in` de 10 (sin N+1), query de ventas acotada + `limit(200)`, `lazy` + `freezeOnBlur` en tabs, venta en una sola transacción, Reanimated en todo (cero `Animated` de RN core), `expo-image` en toda la app, FlashList en productos y carrito, filas memoizadas con `keyExtractor` estables.

---

## 3. DUPLICACIÓN DE COMPONENTES Y HOOKS (16 grupos)

**D1. Fila de producto en ventas duplicada.** `ProductItemVenta.tsx` (139 líneas) y `ProductCardMobile.tsx` (151) son ~90% idénticos (mismo `useCartProductActions`, misma fila imagen+nombre+precio+stepper/botón "+", mismo hack web). → `components/ventas/ProductRow.tsx` con `{ product, onProductAdded, showBrand?, divider? }` usando `useResponsive` internamente. Ahorro ~140 líneas.

**D2. Skeleton duplicado.** `components/ui/Skeleton.tsx:13-48` es copia línea a línea de `components/ui/skeletons/Bone.tsx:23-70`; Bone es superior (reduced-motion + cancelAnimation). Único consumidor: `ProductListContent.tsx:8`. → Borrar `Skeleton.tsx` y re-exportar `Bone` como `Skeleton`.

**D3. Pickers de formulario calcados.** `CampoMarca.tsx` (127 líneas) y `CampoCategoria.tsx` (122): mismo `<select>` web + mismo modal bottom-sheet; `CampoImagen.tsx` repite el shell. → `components/forms/SelectField.tsx` con `{ control, name, label, options, placeholder, error }`; los Campo\* quedan en ~15 líneas. Ahorro ~220 líneas.

**D4. Imagen con fallback reimplementada 6 veces** pese a existir `ProductThumb.tsx`: `ProductCardMobile`, `ProductItemVenta`, `TopProductsList`, `ProductosBajoStockList`, `VentasPorUsuario`, `ConfigTabPerfil`. → Promover a `components/ui/Thumb.tsx` con el estado `imageError` DENTRO; props `{ uri, size, borderRadius?, fallbackIcon? }`. Ahorro ~100 líneas.

**D5. Rows de resumen con esqueleto idéntico.** `RankingRow`, `StockRow` y `VentasPorUsuarioRow` repiten la misma fila `flex-row items-center gap-3 py-2.5` + divider + thumb 36px + título/trailing. → `components/resumen/shared/ResumenRow.tsx` con `{ leading, title, subtitle?, trailing, showDivider, onPress?, rank? }`. Ahorro ~120 líneas.

**D6. Navegación a detalle de producto repetida 3 veces** con contrato de params divergente (`card-products.tsx:29-35`, `TopProductsList.tsx:22-25`, `ProductosBajoStockList.tsx:24-27`). → `lib/navigation/go-to-product.ts` → `goToProductDetail(product)`. (Combinar con P15: pasar solo `id`.)

**D7. Breakpoint inline pese a existir `hooks/use-responsive.ts`** — 8 ocurrencias de `width >= 768`: `ProductoDetailView`, `EditProductView`, `DetailSkeleton`, `productos/index`, `history/index`, `CartPanel`, `ProductListContent`, `AddProductsSheet`. → Sustituir por `useResponsive()`.

**D8. Animación de entrada escalonada duplicada.** `KpiGrid.tsx:31-51` y `VentasPorUsuario.tsx:40-60` (mismo bloque opacity/translateY + reduced-motion + `withDelay(index*50)`). → `hooks/use-staggered-entrance.ts`.

**D9. Avatar con iniciales en 4 implementaciones:** `navbar.tsx` (×2), `ConfigTabPerfil.tsx`, `MiembroRow.tsx`, `VentasPorUsuario.tsx`. → `components/ui/UserAvatar.tsx` con `{ name, photoUri?, size? }`; mover `getInitials` a `lib/utils/format`. Ahorro ~80 líneas.

**D10. Animación press-scale duplicada.** `lib/animations/circle-icon-button.ts` duplica `press-scale.ts` (mismo spring, solo cambia 0.94 vs 0.97); `CircleIconButton.tsx:41-42` reimplementa lo que `usePressScale` empaqueta; `SuccessActions.tsx:22-23` mantiene 2 sharedValues manuales. → Borrar `circle-icon-button.ts` y `usePressScaleHandlers`; usar `usePressScale(reduceMotion, 0.94)`.

**D11. Bottom-sheet modal shell en 4 copias:** `PeriodFilter.tsx:22-76` (la versión más pulida), `CampoMarca.tsx:82-125`, `CampoCategoria.tsx:70-115`, `CampoImagen.tsx`. → Promover MobileModal a `components/ui/BottomSheetModal.tsx` con `{ visible, onClose, children, maxHeight? }`; secundario: `CenteredModal` para `DesktopModal` y `VentaExitosaModal`.

**D12. Sombra web/native repetida 15+ veces** (`Platform.OS === "web" ? { boxShadow } : { elevation }` en 25 archivos): `ProductPriceCard`, `ProductStockCard`, `ProductoDetailView` (×4), `EditProductView`, `VentaCard`, `CardProductDesktop`, `VentaExitosaModal`, `ProductoActions`… → `lib/utils/shadows.ts` con presets (`shadow.card`, `shadow.floating`, `shadow.modal`). Además `ProductPriceCard`/`ProductStockCard` comparten el contenedor exacto → `ElevatedCard` o variante `elevated` de `SectionCard`.

**D13. Micro-label "eyebrow" repetido 12+ veces** (`text-[10px] font-bold tracking-widest uppercase` + `AppFonts.bodyStrong`) y 90+ usos de `fontFamily: AppFonts.*` en `Text` crudo en 30 archivos. → Variante `eyebrow` en `AppText` y migración gradual módulo por módulo.

**D14. Componentes muertos** (ver §5): `OfflineBanner`, `PerformanceMonitor`, `PerformanceReport`; `components/resumen/shared/SectionCard.tsx` es un shim de re-export → migrar los 3 imports a `@/components/ui/SectionCard` y borrarlo.

**D15. Formatos reimplementados inline:** `use-complete-venta.ts:64,82` usa `toLocaleString("es")` en vez de `formatCurrency`/`formatDate` es-CL (mismo hallazgo que B18).

**D16. Settings con `TextInput` crudo y card legacy** (`bg-white dark:bg-neutral-800`, 5 ocurrencias en `ConfigTabPerfil`, `CrearUsuarioForm`, `MiembroRow`) mientras el resto usa `AppTextInput` + tokens `bg-surface-elevated`; `CrearUsuarioForm.tsx:35-58` valida a mano en vez de RHF+Zod. → Migrar a `AppTextInput` y extraer variante `bordered` de card.

### Priorización (ocurrencias × líneas)

| #   | Grupo                                 | Ahorro                          | Esfuerzo        |
| --- | ------------------------------------- | ------------------------------- | --------------- |
| D1  | ProductRow unificado                  | ~140 líneas                     | Medio           |
| D3  | SelectField                           | ~220 líneas                     | Medio           |
| D5  | ResumenRow                            | ~120 líneas                     | Medio           |
| D13 | AppText `eyebrow` + migrar Text crudo | boilerplate masivo (90+ usos)   | Alto (mecánico) |
| D12 | shadow() util + ElevatedCard          | ~60 líneas + consistencia       | Bajo            |
| D7  | useResponsive en 8 sitios             | 1 fuente de verdad              | Bajo            |
| D2  | Borrar Skeleton.tsx                   | ~50 líneas + fix reduced-motion | Trivial         |
| D14 | Borrar muertos                        | ~300 líneas                     | Trivial         |
| D4  | Thumb con estado interno              | ~100 líneas                     | Bajo            |
| D9  | UserAvatar                            | ~80 líneas                      | Bajo            |
| D11 | BottomSheetModal                      | ~120 líneas                     | Medio           |
| D8  | useStaggeredEntrance                  | ~40 líneas                      | Bajo            |
| D10 | Unificar press-scale                  | ~50 líneas                      | Bajo            |
| D6  | goToProductDetail                     | ~20 líneas + contrato único     | Trivial         |
| D15 | formatCurrency en use-complete-venta  | fix de locale                   | Trivial         |
| D16 | Settings a AppTextInput               | consistencia                    | Medio           |

---

## 4. SISTEMA DE TIPOS (`interface/`)

### Duplicados exactos

**T1. La "línea de venta" existe en 3 formas idénticas** (`{ nombre; cantidad; precioUnitario; totalLinea }`): `VentaCompletadaItem` (`interface/checkout/index.ts:1-6`), `LineaVentaDisplay` (`interface/shared/index.ts:25-30`) e inline en `ReciboData.items` (`lib/pdf/recibo-template.ts:4-9`). Irónico: `LineaVentaDisplay` se creó como canónico y tiene 0 usos. → Adoptarlo como canónico; borrar `VentaCompletadaItem` y el inline.

**T2. `SectionCardProps` definido 2 veces idéntico:** `interface/resumen/index.ts:48-52` (muerto) vs `components/ui/SectionCard.tsx:4-8` (el que se usa). → Borrar la copia de `interface/`.

**T3. `VentasDataListener` ≡ `VentasListenerCallbacks`** byte a byte (`store/ventas-data-store.ts:17-21` vs `lib/services/ventas/ventas-listener.ts:6-10`). → Importar del servicio.

**T4. `NotifyType` ≡ `ToastType`** (`lib/notify.ts:3` vs `interface/toast/index.ts:1`) — funciona por coincidencia estructural. → Borrar `NotifyType`.

**T5. `VentaGroup`** — alias `@deprecated` con 0 consumidores (`lib/utils/ventas-helpers.ts:8`). → Borrar.

### Tipos muertos (~20, verificados con grep)

- `interface/clientes/` **carpeta entera** (`Cliente`, `CreateClienteInput`, `UpdateClienteInput`) — no existe servicio ni pantalla.
- `InventarioMovimiento`, `UpdateInventarioMovimientoInput`; `VentaPago`, `UpdateVentaPagoInput` (solo se usan los `Create*`).
- `CreateCategoriaInput`, `UpdateCategoriaInput`, `CreateNegocioInput`, `UpdateNegocioInput`, `CreateSucursalInput`, `UpdateSucursalInput`, `CreateUsuarioInput`, `UpdateVentaDetalleInput`.
- `ThemedProps`, `AddProductsSheetProps` (obsoleto: el componente ya no recibe props), `CartPanelProps` y `ConfigTabPerfilProps` (interfaces VACÍAS), `CampoMarcaProps` (extensión vacía de `ProductFormFieldProps`).
- Imports muertos: `interface/resumen/index.ts:4-5` importa `Venta`/`VentaDetalle` sin usarlos.

### `any` — 10 ocurrencias, solo 1 justificada

| Ubicación                                                          | Fix                                               |
| ------------------------------------------------------------------ | ------------------------------------------------- |
| `EmptyState.tsx:48` (SF Symbol — la excepción)                     | Mejor aún: tipar `iconName` como `IconSymbolName` |
| `services/productos:54`, `services/ventas:58` (`cleanData as any`) | `WithFieldValue<T>` en el converter               |
| `lib/utils/firestore-converter.ts:10`                              | `modelObject as T & { id?: string }`              |
| `Skeleton.tsx:37-38`, `Bone.tsx:54-55` (×4)                        | `DimensionValue` de RN en `SkeletonProps`         |
| `use-producto-detail.ts:89,113` (`router.push(... as any)`)        | revisar typed routes en vez de castear            |

### Inconsistencias de modelado

- **T6. Inglés vs español:** la entidad es `Product` pero todo lo demás es español (`Venta`, `Categoria`…), y convive con `ProductoRanking { producto: Product }`. Carrito en inglés (`CartItem.quantity`) vs venta en español (`VentaDetalle.cantidad`) con traducción manual en `use-complete-venta.ts:77`. → Decidir regla y documentarla en CLAUDE.md.
- **T7. `fecha` con tipos distintos:** `Venta.fecha: Date` vs `VentaCompletada.fecha: string`; el defensivo `instanceof Date ? ... : new Date(...)` en `ventas-helpers.ts:17` delata contrato roto. → Unificar en `Date`.
- **T8. `Usuario` no modela Firestore:** `equipo-store.ts:38,41` castea `rol` (que YA existe en la interfaz) y `foto` (que NO existe). → Añadir `foto?: string` a `Usuario`, quitar casts, y decidir si el rol vive en `usuarios` o en `usuarios_negocios` (relacionado con B11).
- **T9. `CartItem.productId` redundante** — siempre es `product.id`; riesgo de divergencia (`interface/ventas/index.ts:55-60`).
- **T10. `FormState`** (`interface/equipo`) demasiado genérico para un barrel global → `CrearUsuarioFormState`. `ResumenState extends VentasDetallesBaseState {}` extensión vacía → alias.
- **T11. `stockData` con formas distintas** para el mismo dato entre `CardProductsProps` y `CardProductCompactProps` (opcionalidad y `rank` divergentes) → extraer `StockBadgeData`.

### Estructura de `interface/`

- Fusionar `interface/checkout/` → `interface/ventas/` (27 líneas, dependencia cruzada).
- `interface/layout/index.ts:4-27` contiene VALORES (`TAB_BAR_THEME`) y `interface/ui/icons.ts` contiene el `SF_SYMBOL_MAPPING` (55 entradas) — datos, no tipos → mover a `constants/` (además CLAUDE.md dice que el mapping vive en `icon-symbol.tsx`).
- Normalizar: `interface/filtros.ts` es el único archivo plano; `interface/products/` la única carpeta con split interno. Elegir un criterio.
- Carpetas triviales `theme`+`layout`+`toast`+`ui` (~170 líneas juntas) → un solo `interface/ui/`.
- Decidir y documentar: props junto al componente vs en `interface/` (hoy 50/50).

---

## 5. CÓDIGO MUERTO

### Archivos seguros de borrar (verificados con knip + grep manual)

1. `components/ui/OfflineBanner.tsx`
2. `components/ui/PerformanceMonitor.tsx`
3. `components/ui/PerformanceReport.tsx`
4. `lib/utils/profiler.ts` (solo lo importaba PerformanceReport)
5. `hooks/use-product-form.ts`
6. `lib/services/feature-flags.ts` (nunca conectado — elimina también B14)
7. `lib/services/inventario-movimientos/` (complete-venta usa `runTransaction` directo)
8. `lib/services/ventas-pagos/` (el checkout no registra pagos por aquí)
9. `assets/images/google.png` (AuthForm usa `google.webp`)

### Exports muertos en archivos vivos

- `constants/tours.ts`: `PRODUCTOS_TOUR`, `HISTORY_TOUR`, `RESUMEN_TOUR`, `ALL_TOUR_IDS`, `TourId` (solo `VENTAS_TOUR` se usa).
- `useKeyboardShortcuts.ts`: `DEFAULT_SHORTCUTS`; `lib/services/onboarding`: `resetOnboarding`; `lib/services/ventas`: `createVenta`, `updateVenta`; `lib/services/ventas-detalle`: `createVentaDetalle`.
- Quitar `export` (uso solo interno): `app` en `firebase.ts`, `getProductsByNegocio`, `getNegociosByUsuario`, `resolveUsuarioDocId`, `ProductCardSkeleton`, `VentaCardSkeleton`.
- `signUpSchema`/`SignUpFormData` (`lib/validations/auth-schema.ts:14`): alias puro usado solo por tests.

### Dependencias y config

- **Borrar:** `@react-native-picker/picker`, `@testing-library/jest-native` (solo un import comentado en `src/test/setup.ts:2`), `esbuild`.
- **Probablemente borrables (verificar build):** `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/elements` — 0 imports; expo-router SDK 57 ya no los declara como peers.
- **Script roto:** `"reset-project": "node ./scripts/reset-project.js"` apunta a un archivo inexistente → eliminar la entrada.
- `vite.config.ts` es config muerta y engañosa (vitest usa `vitest.config.ts`) → borrar tras confirmar `npm test`.

### Dudosos (decisión del equipo)

`scripts/benchmark.ts`, `seeders/seed.ts`, `lib/pdf/generate-logo-b64.js` (codegen del logo del PDF), `assets/images/pape.png` (arte fuente).

### NO borrar (falsos positivos de knip)

`icon-symbol.ios.tsx`, `icon-symbol.types.ts`, `use-color-scheme.web.ts` (variantes de plataforma de Metro), todo `e2e/` y `.detoxrc.js` (cableados vía Detox).

**Higiene general:** el proyecto está limpio de console.logs (solo el logger intencional) y solo hay 1 TODO/HACK documentado.

---

## 6. PLAN DE ATAQUE SUGERIDO

**Fase 0 — Correcciones urgentes (1 sesión):**

1. B1 reembolsos (reads antes de writes) — bug funcional que rompe reembolsos multi-producto.
2. B2 reglas de Firestore multi-tenant.
3. B3 persistencia de sesión (`initializeAuth` + AsyncStorage).

**Fase 1 — Limpieza sin riesgo (1 sesión):** borrar los 9 archivos muertos, exports muertos, deps sin usar, script roto, tipos muertos (§4 y §5), D2 (Skeleton→Bone), D6, D15/B18.

**Fase 2 — Quick wins de rendimiento (1-2 sesiones):** P1 (cache de catálogo — el de mayor impacto), P2+P12 (Map en resumen), P3, P4, P5, P8, P9, P11.

**Fase 3 — Consolidación de tipos:** T1-T5, matar los `any`, T8 (`foto` en Usuario), fusionar `checkout`→`ventas`, mover datos a `constants/`.

**Fase 4 — Componentes reutilizables:** D12 (shadows) y D7 (useResponsive) primero (bajo esfuerzo, tocan muchos archivos), luego D4 (Thumb), D9 (UserAvatar), D8, D10; después las consolidaciones medianas D1 (ProductRow), D5 (ResumenRow), D3+D11 (SelectField+BottomSheetModal juntos).

**Fase 5 — Mecánico de largo aliento:** D13 (migración a AppText por módulo), D16 (settings), B4-B11 restantes según prioridad.

Cada fase es commiteable de forma independiente; las fases 1-2 no cambian comportamiento visible (salvo eliminar bugs) y son ideales para esta rama `refactor/cleanup-checkpoint`.
