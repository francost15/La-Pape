# Depurar código muerto y dependencias no utilizadas

Analiza este proyecto en busca de **código no utilizado** y **dependencias innecesarias** en `package.json`.

## Paso 1 — Leer package.json

Lee `package.json` y extrae todas las dependencias (`dependencies` + `devDependencies`).

## Paso 2 — Escanear imports en el código fuente

Usa Grep para buscar todos los `import` y `require` en estos directorios:
- `app/`
- `components/`
- `hooks/`
- `lib/`

Patrones a buscar:
```
from ['"]([^./][^'"]+)['"]
require\(['"]([^./][^'"]+)['"]\)
```

Construye una lista de **paquetes externos realmente importados** (ignora imports relativos `./`, `../`, `@/`).

## Paso 3 — Detectar dependencias no utilizadas

Compara las dependencias del `package.json` contra los paquetes encontrados en el código.

Considera como **utilizados implícitamente** (no marcar como no usados):
- `expo` — motor del proyecto
- `expo-router` — routing (declarativo, no siempre aparece en imports)
- `expo-splash-screen` — se configura en `app.json` o `_layout`
- `expo-status-bar` — puede estar en layouts
- `expo-system-ui` — configuración nativa
- `expo-dev-client` — solo para builds de desarrollo
- `react`, `react-dom`, `react-native`, `react-native-web` — peers/runtime
- `nativewind`, `tailwindcss`, `postcss`, `@tailwindcss/postcss` — build pipeline
- `typescript`, `eslint`, `eslint-config-expo` — tooling
- `@types/react` — types

Para el resto, si no aparecen en ningún import del código fuente, márcalos como **candidatos a eliminar**.

## Paso 4 — Detectar archivos con exports sin usar

Busca archivos en `components/`, `hooks/`, `lib/` que **exporten funciones/componentes** pero que **ningún otro archivo importe**.

Para cada archivo que encuentres:
1. Obtén sus exports (`export function`, `export const`, `export default`, `export class`)
2. Busca con Grep si algún archivo importa desde esa ruta
3. Si ningún archivo lo importa → marcar como **archivo huérfano**

## Paso 5 — Detectar funciones/variables exportadas pero no consumidas

Dentro de archivos que SÍ son importados, busca exports nombrados específicos que nunca se usen en el resto del proyecto.

## Paso 6 — Detectar imports locales no usados

Busca patrones comunes de imports sin uso dentro de archivos individuales (importados pero no referenciados en el JSX/lógica del archivo).

## Paso 7 — Generar reporte

Presenta un reporte estructurado así:

---

### 📦 Dependencias no utilizadas (candidatas a eliminar de package.json)
Lista cada paquete con justificación de por qué parece no usarse.

### 🗂️ Archivos huérfanos (ningún archivo los importa)
Lista cada archivo con su ruta.

### 🔧 Exports sin consumidores
Lista `archivo → export` que no se usan en ningún otro lugar.

### ⚠️ Imports locales sin usar (dentro de archivos)
Lista `archivo:línea → import` que parece no estar siendo usado.

### ✅ Recomendaciones
Acciones concretas ordenadas por impacto (primero lo más fácil/seguro de eliminar).

---

**IMPORTANTE**: No elimines nada automáticamente. Solo reporta hallazgos y espera confirmación del usuario antes de hacer cambios. Si un archivo o dependencia tiene uso no obvio (ej: efectos de lado, plugins de build, polyfills nativos), señálalo con una advertencia ⚠️.
