# React Native Guidelines — Compiled Output

**Version 1.0.0** | Engineering | January 2026

> This document is for agents and LLMs when maintaining, generating, or refactoring React Native codebases. Guidance is optimized for automation and consistency.

## Abstract

Comprehensive performance optimization guide for React Native. 35+ rules across 13 categories. Prioritized by impact: CRITICAL (crashes, broken UI) → HIGH (performance) → MEDIUM → LOW.

---

## Quick Lookup

| Area | Impact | Key Rules |
|------|--------|-----------|
| Core Rendering | CRITICAL | No falsy &&, wrap strings in Text |
| List Performance | HIGH | Virtualize, stable refs, no inline objects, primitives, lightweight items, compressed images, getItemType |
| Animation | HIGH | Transform/opacity, GestureDetector, useDerivedValue |
| Scroll | HIGH | Never useState for scroll |
| Navigation | HIGH | Native stack/tabs |
| React State | MEDIUM | Functional setState, fallback, minimize |
| State Architecture | MEDIUM | Ground truth |
| React Compiler | MEDIUM | Destructure, .get()/.set() |
| User Interface | MEDIUM | expo-image, Galeria, Zeego, Modal formSheet, Pressable, contentInsetAdjustmentBehavior |
| Design System | MEDIUM | Compound components |
| Monorepo | LOW | Native deps in app, single versions |
| Imports / JS / Fonts | LOW | Design system folder, hoist Intl, fonts at build |

---

## Rule Files Index

See [rules/_sections.md](rules/_sections.md) for full list. Individual rules in `rules/` folder.

## Source

- **SKILL.md**: Main instructions (this skill)
- **reference/full-guidelines.md**: Detailed reference
- **rules/**: Individual rule files with examples
