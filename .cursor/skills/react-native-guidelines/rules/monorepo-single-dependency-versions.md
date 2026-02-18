---
title: Use Single Dependency Versions Across Monorepo
impact: MEDIUM
impactDescription: Avoids duplicate bundles, version conflicts
tags: monorepo, syncpack, versions
---

## Use Single Dependency Versions Across Monorepo

Use exact versions. Use syncpack; or yarn resolutions / pnpm overrides.

**Incorrect:**

```json
// packages/app
"react-native-reanimated": "^3.0.0"
// packages/ui
"react-native-reanimated": "^3.5.0"
```

**Correct:**

```json
// root package.json
"pnpm": { "overrides": { "react-native-reanimated": "3.16.1" } }
// All packages: "react-native-reanimated": "3.16.1"
```
