---
title: Install Native Dependencies in App Directory
impact: CRITICAL
impactDescription: Required for autolinking
tags: monorepo, autolinking, native
---

## Install Native Dependencies in App Directory

In a monorepo, packages with native code must be installed in the app's directory. Autolinking only scans app's node_modules.

**Incorrect:**

```
packages/ui/package.json  # has react-native-reanimated
packages/app/package.json # missing it
```

**Correct:**

```json
// packages/app/package.json
{
  "dependencies": {
    "react-native-reanimated": "3.16.1"
  }
}
```

The app must list native deps even if shared packages use them.
