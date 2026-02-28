# Area Nicknames — Design Doc
**Date:** 2026-02-28
**Status:** Approved

## Problem
The `area` field stores raw street addresses (e.g. "123 E Colfax Ave") which are hard to recognize at a glance. Users want a friendly nickname (e.g. "The Smith House") that shows in place of the raw address.

## Solution
Global area nickname map: `Record<string, string>` keyed by raw area string. One nickname per unique area, shared across all people/activities that share that area string.

## Data Model

### `src/types/index.ts`
- Add `areaNicknames: Record<string, string>` to `AppState`
- Add `areaNicknames?: Record<string, string>` to `SerializableState` (optional for backward compat)

## AppContext (`src/context/AppContext.tsx`)
- Add `areaNicknames` state, initialized from localStorage or `{}`
- Add `updateAreaNickname(area: string, nickname: string): void`
  - Empty nickname removes the key
- Include `areaNicknames` in localStorage serialization/deserialization

## UI Changes

### Map (`src/components/map/MapView.tsx`) — primary management UI
- **Tooltip (hover):** show nickname if set, otherwise raw area
- **Popup (click):**
  - Show nickname prominently if set, raw area in small muted text below
  - Inline input pre-filled with current nickname + "Save" button
  - Saving empty string clears the nickname
  - Calls `updateAreaNickname` from context

### People Table (`src/components/tables/PeopleTable.tsx`)
- Area column: display nickname when available, raw area otherwise
- `title` attribute on the cell shows raw area on hover

## Files to Modify
1. `src/types/index.ts`
2. `src/context/AppContext.tsx`
3. `src/components/map/MapView.tsx`
4. `src/components/tables/PeopleTable.tsx`

## Out of Scope
- Nickname management screen
- Nicknames in detail panel (can be added later)
- Nicknames on activity pins (can be added later)
