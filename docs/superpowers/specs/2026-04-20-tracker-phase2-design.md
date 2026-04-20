# Tracker App — Phase 2 Design Spec
**Date:** 2026-04-20  
**Status:** Approved

## Overview

A set of six coordinated improvements to the RoomMap Ops Tracker app:

1. Navigation cleanup (remove Home Visits tab, add Calendar tab)
2. Light UI theme
3. Activities active/inactive status
4. Programs tab updates (rename + in-progress/completed lists)
5. Analytics Growth Over Time section
6. Bahai Calendar tab (iCal import)

---

## 1. Navigation & Structure

### Tabs Removed
- **Home Visits** tab removed from navigation entirely
- `"homevisits"` removed from `ViewMode` type in `src/types/index.ts`
- `HomeVisitsTracker` component no longer rendered in `App.tsx`

### Forms Tab Cleanup
- Remove the **Home Visit Report** form entry from `src/components/forms/Forms.tsx`
- Keep **New Person** form only
- The `HomeVisit` type and existing `homeVisits` arrays on Person records remain intact — historical data is preserved, only the UI entry point is removed

### Tabs Added
- **Calendar** tab added as the last tab in the nav
- New `ViewMode` value: `"calendar"`

### Final Tab Order
People → Cohorts → Families → Activities → Analytics → Forms → Programs → Reflections → Map → Calendar

---

## 2. Light UI Theme

All color changes go through CSS custom properties in `src/styles.css`. No component-level color values need changing.

### Variable Targets

| Variable | New Value | Purpose |
|---|---|---|
| `--bg-primary` | `#ffffff` | Main background |
| `--bg-secondary` | `#f8f9fa` | Page/sidebar background |
| `--bg-card` | `#ffffff` | Card/panel backgrounds |
| `--text-primary` | `#111827` | Headings, main text |
| `--text-secondary` | `#6b7280` | Secondary/muted text |
| `--border-color` | `#e5e7eb` | All borders |
| `--accent` | `#4f46e5` | Buttons, active states, chips |
| `--hover-bg` | `#f9fafb` | Table row hover |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Card shadows |

### Principles
- White cards on light gray page background
- Subtle shadows instead of dark borders for depth
- Indigo accent kept for brand consistency
- No dark backgrounds anywhere in the main UI

---

## 3. Activities — Active / Inactive Status

### Type Change
Add to `Activity` interface in `src/types/index.ts`:
```ts
isActive?: boolean; // defaults to true when absent
```
Backward compatible — existing activities without this field are treated as active.

### UI Changes

**ActivitiesTable** (`src/components/tables/ActivitiesTable.tsx`):
- Each row gets a status badge: green "Active" / gray "Inactive"
- Filter toggle above the table: All | Active | Inactive (defaults to All)

**ActivityModalContent** (`src/components/modals/ActivityModalContent.tsx`):
- Toggle at the bottom of the form: "Mark as Inactive"

**DetailPanel** (`src/components/panels/DetailPanel.tsx`):
- Status badge shown next to activity name

### Behavior
- Inactive activities are **visible by default** (not hidden), just badged
- They remain in a person's connected activities list
- They count in historical analytics (dateCreated still valid)
- The active/inactive filter lets users show only one group if desired

---

## 4. Programs Tab Updates

### Rename
In `src/components/panels/ProgramsPanel.tsx`, change display label:
- `"Study Circles"` → `"Study Circle Intensives"`
- Internal `ProgramKind` value `"study-circle"` stays unchanged (no data migration)

### In Progress / Completed List Layout

**Program Events:**
Split the flat event list into two visual sections:

- **In Progress** (top): events with `status: "planned"` or `"ongoing"`
  - Colored left border (blue for planned, green for ongoing)
  - Full interactivity (expand, edit, delete)
- **Completed / Cancelled** (bottom): events with `status: "completed"` or `"cancelled"`
  - Separated by a labeled divider
  - Muted/gray styling
  - Collapsible as a group

**Learning Objects (Objects of Learning tab):**
- **In Progress** (top): `status: "active"` items
- **Completed** (bottom): `status: "completed"` items below a divider
  - Shown with a checkmark indicator and muted text

No new data fields needed — existing `ProgramStatus` and `LearningObjectStatus` types cover this.

---

## 5. Analytics — Growth Over Time

### Placement
New `GrowthOverTime` section added at the **top** of the Analytics tab, above existing stats. Wrapped in the existing `AnalyticsErrorBoundary`.

### New Component
`src/components/analytics/GrowthOverTime.tsx`

Follows the existing `MetricsCard` pattern. Three panels displayed side by side (stacking on narrow screens):

#### Panel 1 — Real-Time Counts
Live numbers derived from current state:
- Total people, total active activities
- People added this month (count where `dateAdded` is in current calendar month)
- Delta vs last month with ↑↓ arrow and color (green up, red down, gray neutral)

#### Panel 2 — Month-to-Month
Card row showing last 3 months:
- Columns: Month, New People, New Activities, % Change (people)
- % change = `((thisMonth - lastMonth) / lastMonth) * 100`, rounded to 1 decimal

#### Panel 3 — 6-Month Trend
Bar chart using pure CSS (no charting library):
- Two bar series per month: People (indigo) and Activities (teal)
- X-axis: last 6 month labels (e.g. "Nov", "Dec", "Jan"...)
- Bars scale relative to the max value in the window
- Tooltip on hover showing exact count

#### Data Source
All computed at render time from:
- `person.dateAdded` for people counts
- `activity.dateCreated` for activity counts
- No new storage, no migration

Families are **not** tracked in growth charts per design decision.

---

## 6. Bahai Calendar Tab

### New Files
- `src/components/calendar/CalendarView.tsx` — main view component
- `src/components/calendar/index.ts` — barrel export
- `src/utils/icsParser.ts` — parses raw `.ics` text into typed event objects

### State Changes
Add to `AppState` and `SerializableState` in `src/types/index.ts`:
```ts
calendarUrl?: string;
```
Add to `AppContext`:
```ts
setCalendarUrl: (url: string) => void;
```

### Setup Flow (First Visit)
1. User sees a prompt: "Paste your Google Calendar iCal URL to get started"
2. Instructions shown: Calendar Settings → Secret address in iCal format
3. URL saved to localStorage via `setCalendarUrl`
4. App fetches and parses the feed immediately
5. URL persists — auto-fetches on subsequent visits with a "Refresh" button

### iCal Parser (`src/utils/icsParser.ts`)
Parses raw `.ics` text. Extracts per-event:
- `summary` (SUMMARY field) — event name
- `start` (DTSTART) — parsed to JS Date
- `end` (DTEND) — parsed to JS Date (optional)
- `description` (DESCRIPTION) — optional notes

Returns `CalendarEvent[]`. No external library — `.ics` is line-based plain text.

### Display (`CalendarView.tsx`)
- Events listed chronologically, grouped by month heading
- Past events hidden by default; "Show past events" toggle reveals them
- Each event: name (bold), date/time, optional description (collapsed, expandable)
- Loading state while fetching
- Error state (fetch failed or invalid URL) with "Retry" button and clear message
- Electron makes the fetch directly — no CORS proxy needed

### Fetch Strategy
- Fetch triggered on: tab open (if URL set), "Refresh" button click
- No polling — manual refresh only
- Results cached in component state for the session

---

## Files Modified

| File | Change |
|---|---|
| `src/types/index.ts` | Remove `"homevisits"` from ViewMode; add `"calendar"`; add `isActive` to Activity; add `calendarUrl` to AppState/SerializableState |
| `src/context/AppContext.tsx` | Add `setCalendarUrl` action; persist `calendarUrl` |
| `src/App.tsx` | Add Calendar tab rendering; remove HomeVisitsTracker; add nav item |
| `src/components/common/Header.tsx` | Update nav tabs list |
| `src/styles.css` | Replace dark theme variables with light theme values |
| `src/components/forms/Forms.tsx` | Remove Home Visit Report section |
| `src/components/tables/ActivitiesTable.tsx` | Add isActive badge + filter toggle |
| `src/components/modals/ActivityModalContent.tsx` | Add isActive toggle |
| `src/components/panels/DetailPanel.tsx` | Show isActive badge for activities |
| `src/components/panels/ProgramsPanel.tsx` | Rename Study Circles; split list into in-progress/completed sections |
| `src/components/analytics/Analytics.tsx` | Add GrowthOverTime section at top |

## Files Created

| File | Purpose |
|---|---|
| `src/components/analytics/GrowthOverTime.tsx` | Growth metrics component |
| `src/components/calendar/CalendarView.tsx` | Bahai calendar view |
| `src/components/calendar/index.ts` | Barrel export |
| `src/utils/icsParser.ts` | iCal text parser |

---

## Out of Scope

- Google Calendar OAuth / private calendar access
- Two-way calendar sync
- Removing `homeVisits` data from Person records
- Changing `ProgramKind` internal values
- Adding new analytics beyond growth (existing analytics unchanged)
