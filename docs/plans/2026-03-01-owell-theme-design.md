# Owell Dark Theme — Design Doc
**Date:** 2026-03-01
**Status:** Approved

## Goal
Retheme `src/styles.css` from warm amber/brown to a cold near-black + indigo palette inspired by the Owell Web3 design.

## Approach
CSS variables swap (Option A) — change `:root` tokens + fix hardcoded color values that bypass vars. No layout or structural changes.

## File
**Only file touched:** `src/styles.css`

## Color Palette

| Variable    | Before (warm)  | After (cool)   |
|-------------|----------------|----------------|
| `--bg`      | `#1a120e`      | `#08080f`      |
| `--panel`   | `#2a1f1a`      | `#0f0f1a`      |
| `--panel-2` | `#3a2b23`      | `#161626`      |
| `--border`  | `#5a4539`      | `#1e1e35`      |
| `--accent`  | `#d4a574`      | `#6366f1`      |
| `--accent-2`| `#a0522d`      | `#818cf8`      |
| `--text`    | `#f5e6d3`      | `#e2e8f0`      |
| `--muted`   | `#b89f88`      | `#64748b`      |
| `--success` | `#6b7f5f`      | `#22c55e`      |
| `--warning` | `#d2691e`      | `#f59e0b`      |
| `--danger`  | `#8b3a3a`      | `#ef4444`      |

## Body Background
```css
background: radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 50%),
            radial-gradient(circle at bottom left, rgba(59,130,246,0.06), transparent 50%),
            #08080f;
```

## Hardcoded Values to Update
- `.topbar` bg: `rgba(26,18,14,0.9)` → `rgba(8,8,15,0.9)`
- `.brand__logo` gradient: amber/rust → `linear-gradient(135deg, #6366f1, #3b82f6)`
- `.brand__logo` text: `#1a120e` → `#ffffff`
- `.list-item:hover` bg: warm tint → `rgba(99,102,241,0.06)`
- `.list-item--active` bg: warm tint → `rgba(99,102,241,0.12)`
- `.filter-bar` bg: warm tint → `rgba(15,15,26,0.7)`
- `.canvas` radial gradients: amber/rust tints → indigo/blue tints
- `.search-input:hover` border: amber → `rgba(99,102,241,0.5)`
- `.search-input:focus` glow: amber → `rgba(99,102,241,0.15)`
- `.tab:hover` bg: amber tint → `rgba(99,102,241,0.1)`

## Out of Scope
- `src/styles/index.css` (light theme) — untouched
- Layout, component structure, fonts — unchanged
