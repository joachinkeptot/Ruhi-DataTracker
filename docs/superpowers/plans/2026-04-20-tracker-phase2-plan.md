# Tracker App Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Growth analytics, Bahai Calendar tab, light UI theme, activity status badges, Programs improvements, and navigation cleanup to the RoomMap Ops Tracker app.

**Architecture:** All features build on the existing React + TypeScript + localStorage pattern. New state (calendarUrl) threads through AppContext exactly like areaNicknames. Two new components (GrowthOverTime, CalendarView) follow the MetricsCard pattern. No new libraries needed — recharts is already installed.

**Tech Stack:** React 18, TypeScript, Vite, Electron, recharts (already in package.json), localStorage persistence via AppContext.

**Verification command (no test framework):** `npm run type-check` — runs `tsc --noEmit`. Use after every task. Visual verification requires `npm run dev`.

---

## Task 1: Type System Foundation

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Update ViewMode — remove "homevisits", add "calendar"**

In `src/types/index.ts`, replace:
```ts
export type ViewMode =
  | "people"
  | "cohorts"
  | "families"
  | "activities"
  | "homevisits"
  | "analytics"
  | "forms"
  | "programs"
  | "reflections"
  | "map";
```
With:
```ts
export type ViewMode =
  | "people"
  | "cohorts"
  | "families"
  | "activities"
  | "analytics"
  | "forms"
  | "programs"
  | "reflections"
  | "map"
  | "calendar";
```

- [ ] **Step 2: Add isActive to Activity interface**

In `src/types/index.ts`, in the `Activity` interface, add after `lastSessionDate?: string;`:
```ts
isActive?: boolean; // defaults to true when absent; backward compatible
```

- [ ] **Step 3: Add calendarUrl to AppState**

In `src/types/index.ts`, in the `AppState` interface, add after `areaNicknames: Record<string, string>;`:
```ts
calendarUrl?: string;
```

- [ ] **Step 4: Add calendarUrl to SerializableState**

In `src/types/index.ts`, in the `SerializableState` interface, add after `areaNicknames?: Record<string, string>;`:
```ts
calendarUrl?: string;
```

- [ ] **Step 5: Run type-check**

```bash
npm run type-check
```
Expected: TypeScript errors about `"homevisits"` in Header.tsx and App.tsx — these are correct (we fix them in Task 3). No errors about the new fields.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: update types for phase 2 — ViewMode calendar, Activity.isActive, calendarUrl"
```

---

## Task 2: AppContext — calendarUrl State & Action

**Files:**
- Modify: `src/context/AppContext.tsx`

- [ ] **Step 1: Add calendarUrl to AppContextType interface**

In `src/context/AppContext.tsx`, in the `AppContextType` interface (after `importData`), add:
```ts
setCalendarUrl: (url: string) => void;
```

- [ ] **Step 2: Add calendarUrl useState**

In `src/context/AppContext.tsx`, after the `areaNicknames` useState line, add:
```ts
const [calendarUrl, setCalendarUrlState] = useState<string>("");
```

- [ ] **Step 3: Load calendarUrl from localStorage**

In the load `useEffect` (the one that calls `loadFromLocalStorage()`), after `setAreaNicknames(savedData.areaNicknames || {});`, add:
```ts
setCalendarUrlState(savedData.calendarUrl || "");
```

- [ ] **Step 4: Save calendarUrl to localStorage**

In the save `useEffect`, in the `state` object inside the setTimeout callback, add `calendarUrl` after `areaNicknames`:
```ts
const state = {
  people,
  activities,
  families,
  programEvents,
  learningObjects,
  reflections,
  savedQueries,
  selected,
  groupPositions: Object.fromEntries(groupPositions),
  viewMode,
  cohortViewMode,
  showConnections,
  areaNicknames,
  calendarUrl,
};
```

Also add `calendarUrl` to the dependency array of that `useEffect`:
```ts
], [
  isLoaded,
  people,
  activities,
  families,
  programEvents,
  learningObjects,
  reflections,
  savedQueries,
  selected,
  groupPositions,
  viewMode,
  cohortViewMode,
  showConnections,
  areaNicknames,
  calendarUrl,
]);
```

- [ ] **Step 5: Define setCalendarUrl action**

After the `updateAreaNickname` function, add:
```ts
const setCalendarUrl = (url: string) => {
  setCalendarUrlState(url);
};
```

- [ ] **Step 6: Add calendarUrl and setCalendarUrl to context value**

In the `value` object, after `areaNicknames`, add:
```ts
calendarUrl,
setCalendarUrl,
```

- [ ] **Step 7: Run type-check**

```bash
npm run type-check
```
Expected: No new errors (calendarUrl errors in App.tsx come later).

- [ ] **Step 8: Commit**

```bash
git add src/context/AppContext.tsx
git commit -m "feat: add calendarUrl state and action to AppContext"
```

---

## Task 3: Navigation — Remove Home Visits, Add Calendar

**Files:**
- Modify: `src/components/common/Header.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Remove Home Visits tab from Header**

In `src/components/common/Header.tsx`, remove the entire button block:
```tsx
<button
  className={`tab ${viewMode === "homevisits" ? "tab--active" : ""}`}
  onClick={() => handleViewChange("homevisits")}
  role="tab"
>
  Home Visits
</button>
```

- [ ] **Step 2: Add Calendar tab to Header**

In `src/components/common/Header.tsx`, after the Map tab button, add:
```tsx
<button
  className={`tab ${viewMode === "calendar" ? "tab--active" : ""}`}
  onClick={() => handleViewChange("calendar")}
  role="tab"
>
  Calendar
</button>
```

- [ ] **Step 3: Remove Home Visits rendering from App.tsx**

In `src/App.tsx`, remove the entire branch:
```tsx
) : viewMode === "homevisits" ? (
  <div className="panel__section">
    <HomeVisitsTracker />
  </div>
```

Also remove the `HomeVisitsTracker` import at the top of the file:
```tsx
import {
  DetailPanel,
  Statistics,
  HomeVisitsTracker,  // remove this line
  ProgramsPanel,
  Reflections,
} from "./components/panels";
```
Replace with:
```tsx
import {
  DetailPanel,
  Statistics,
  ProgramsPanel,
  Reflections,
} from "./components/panels";
```

- [ ] **Step 4: Add Calendar rendering to App.tsx**

In `src/App.tsx`, after the `viewMode === "map"` branch:
```tsx
) : viewMode === "map" ? (
  <MapView people={filteredPeople} />
```
Add a new branch before the closing `) : (`:
```tsx
) : viewMode === "map" ? (
  <MapView people={filteredPeople} />
) : viewMode === "calendar" ? (
  <div className="panel__section">
    <CalendarView />
  </div>
```

- [ ] **Step 5: Add CalendarView import to App.tsx**

At the top of `src/App.tsx`, add after the MapView import:
```tsx
import { CalendarView } from "./components/calendar";
```
Note: This import will fail until Task 10 creates the file. The type-check will error — that is expected. Proceed anyway; it resolves in Task 10.

- [ ] **Step 6: Run type-check**

```bash
npm run type-check
```
Expected: Error about missing `./components/calendar` module — this is expected and resolves in Task 10. No other errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/common/Header.tsx src/App.tsx
git commit -m "feat: remove Home Visits tab, add Calendar tab to navigation"
```

---

## Task 4: Forms Cleanup — Remove Home Visit Report

**Files:**
- Modify: `src/components/forms/Forms.tsx`

- [ ] **Step 1: Remove Home Visit state variables**

In `src/components/forms/Forms.tsx`, remove these state declarations (lines that declare these variables):
```ts
const [visitPerson, setVisitPerson] = useState("");
const [visitDate, setVisitDate] = useState("");
const [visitors, setVisitors] = useState("");
const [purpose, setPurpose] = useState<VisitPurpose>("Social");
const [visitNotes, setVisitNotes] = useState("");
const [relationshipsDiscovered, setRelationshipsDiscovered] = useState("");
const [interestsExpressed, setInterestsExpressed] = useState("");
const [followUp, setFollowUp] = useState("");
const [followUpDate, setFollowUpDate] = useState("");
```

- [ ] **Step 2: Remove handleHomeVisitSubmit and resetHomeVisitForm**

Remove the entire `handleHomeVisitSubmit` function (from `const handleHomeVisitSubmit = ...` through its closing `};`).

Remove the entire `resetHomeVisitForm` function:
```ts
const resetHomeVisitForm = () => {
  setVisitPerson("");
  setVisitDate("");
  setVisitors("");
  setPurpose("Social");
  setVisitNotes("");
  setRelationshipsDiscovered("");
  setInterestsExpressed("");
  setFollowUp("");
  setFollowUpDate("");
};
```

- [ ] **Step 3: Remove Home Visit card from form selection UI**

In the JSX, find the form selection cards section and remove the Home Visit card button entirely. Replace:
```tsx
<div className="form-cards">
  <button
    className="form-card"
    onClick={() => setActiveFormType("person")}
  >
    <div className="form-card-icon">👤</div>
    <div className="form-card-title">New Person</div>
    <div className="form-card-desc">
      Add a new person to the community
    </div>
  </button>

  <button
    className="form-card"
    onClick={() => setActiveFormType("homevisit")}
  >
    <div className="form-card-icon">🏠</div>
    <div className="form-card-title">Home Visit Report</div>
    <div className="form-card-desc">
      Record details of a home visit
    </div>
  </button>
</div>
```
With:
```tsx
<div className="form-cards">
  <button
    className="form-card"
    onClick={() => setActiveFormType("person")}
  >
    <div className="form-card-icon">👤</div>
    <div className="form-card-title">New Person</div>
    <div className="form-card-desc">
      Add a new person to the community
    </div>
  </button>
</div>
```

- [ ] **Step 4: Remove the Home Visit form JSX block**

In the "Active Form" section, remove the entire block:
```tsx
{/* Home Visit Form */}
{activeFormType === "homevisit" && (
  <form onSubmit={handleHomeVisitSubmit} className="data-form">
    ...entire form...
  </form>
)}
```
(This is the block starting with `{/* Home Visit Form */}` through its closing `)}`)

- [ ] **Step 5: Clean up unused imports**

In `src/components/forms/Forms.tsx`, remove `HomeVisit` and `VisitPurpose` from the types import. Change:
```ts
import {
  FormSubmission,
  FormType,
  HomeVisit,
  VisitPurpose,
  AgeGroup,
  EmploymentStatus,
} from "../../types";
```
To:
```ts
import {
  FormSubmission,
  FormType,
  AgeGroup,
  EmploymentStatus,
} from "../../types";
```

Also remove `updatePerson` from the useApp destructure since it was only used for home visits:
```ts
const { people, addPerson, updatePerson } = useApp();
```
Replace with:
```ts
const { people, addPerson } = useApp();
```

- [ ] **Step 6: Run type-check**

```bash
npm run type-check
```
Expected: Only the known error about missing `./components/calendar` module from Task 3.

- [ ] **Step 7: Commit**

```bash
git add src/components/forms/Forms.tsx
git commit -m "feat: remove Home Visit Report form, keep New Person only"
```

---

## Task 5: Light UI Theme

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Replace CSS root variables**

In `src/styles.css`, replace the entire `:root` block:
```css
:root {
  color-scheme: dark;
  --bg: #08080f;
  --panel: #0f0f1a;
  --panel-2: #161626;
  --border: #1e1e35;
  --accent: #6366f1;
  --accent-2: #818cf8;
  --text: #e2e8f0;
  --muted: #64748b;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```
With:
```css
:root {
  color-scheme: light;
  --bg: #f8f9fa;
  --panel: #ffffff;
  --panel-2: #f1f3f5;
  --border: #e5e7eb;
  --accent: #4f46e5;
  --accent-2: #6366f1;
  --text: #111827;
  --muted: #6b7280;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
}
```

- [ ] **Step 2: Replace hardcoded dark body background**

In `src/styles.css`, replace the `body` rule:
```css
body {
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 50%),
    radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.06), transparent 50%),
    #08080f;
  color: var(--text);
  min-height: 100vh;
}
```
With:
```css
body {
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
```

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```
Open the app and confirm: white/light gray background, dark text, no dark panels. The accent indigo color should appear on active tabs and primary buttons. If any component has hardcoded dark hex values as inline styles that look broken, note them for a follow-up fix.

- [ ] **Step 4: Commit**

```bash
git add src/styles.css
git commit -m "feat: light UI theme — replace dark CSS variables with clean light palette"
```

---

## Task 6: Activities — Active/Inactive Status

**Files:**
- Modify: `src/components/tables/ActivitiesTable.tsx`
- Modify: `src/components/modals/ActivityModalContent.tsx`

- [ ] **Step 1: Add status filter and badge to ActivitiesTable**

Replace the entire contents of `src/components/tables/ActivitiesTable.tsx` with:
```tsx
import React, { useState } from "react";
import { Person, Activity } from "../../types";

interface ActivitiesTableProps {
  activities: Activity[];
  people: Person[];
  onSelectActivity: (id: string) => void;
}

type StatusFilter = "all" | "active" | "inactive";

export const ActivitiesTable: React.FC<ActivitiesTableProps> = ({
  activities,
  people,
  onSelectActivity,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = activities.filter((a) => {
    if (statusFilter === "active") return a.isActive !== false;
    if (statusFilter === "inactive") return a.isActive === false;
    return true;
  });

  return (
    <div className="table-wrap">
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
        {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            className={`btn btn--sm ${statusFilter === s ? "btn--primary" : ""}`}
            onClick={() => setStatusFilter(s)}
            style={{ textTransform: "capitalize" }}
          >
            {s}
          </button>
        ))}
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Status</th>
            <th>Leader</th>
            <th>Participants</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((activity) => {
            const isActive = activity.isActive !== false;
            return (
              <tr key={activity.id} onClick={() => onSelectActivity(activity.id)}>
                <td>
                  <div className="table-title">{activity.name}</div>
                  <div className="table-subtitle">
                    {activity.area || "No area"}
                  </div>
                </td>
                <td>
                  <span className="chip">{activity.type}</span>
                </td>
                <td>
                  <span
                    className="chip"
                    style={{
                      background: isActive ? "#dcfce7" : "#f3f4f6",
                      color: isActive ? "#16a34a" : "#6b7280",
                      border: `1px solid ${isActive ? "#bbf7d0" : "#e5e7eb"}`,
                    }}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{activity.facilitator || activity.leader || "-"}</td>
                <td>
                  <div className="chip-row">
                    {activity.participantIds.length === 0 && "-"}
                    {activity.participantIds.slice(0, 3).map((id: string) => {
                      const person = people.find((p) => p.id === id);
                      return (
                        <span key={id} className="chip chip--muted">
                          {person?.name || "Unknown"}
                        </span>
                      );
                    })}
                    {activity.participantIds.length > 3 && (
                      <span className="chip chip--muted">
                        +{activity.participantIds.length - 3}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
```

- [ ] **Step 2: Add isActive toggle to ActivityModalContent**

In `src/components/modals/ActivityModalContent.tsx`, add `isActive` state after the existing state declarations:
```ts
const [isActive, setIsActive] = useState<boolean>(true);
```

In the `useEffect` that loads activity data, after `setActivityParticipants(activity.participantIds || []);`, add:
```ts
setIsActive(activity.isActive !== false);
```

In the `resetForm` function, add:
```ts
setIsActive(true);
```

In `activityData` object inside `handleSubmit`, add `isActive`:
```ts
const activityData: Omit<Activity, "id"> = {
  name: name.trim(),
  type: activityType,
  leader: leader.trim() || undefined,
  facilitator: leader.trim() || undefined,
  notes: notes.trim() || undefined,
  participantIds: activityParticipants,
  isActive,                              // add this line
  materials: undefined,
  dateCreated: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  position: { x: Math.random() * 700, y: Math.random() * 400 },
  reflections: [],
};
```

In the JSX, add the toggle at the bottom of the form, just before the submit button:
```tsx
<div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
  <label style={{ margin: 0 }}>Status</label>
  <button
    type="button"
    className={`btn btn--sm ${isActive ? "btn--primary" : ""}`}
    onClick={() => setIsActive(true)}
  >
    Active
  </button>
  <button
    type="button"
    className={`btn btn--sm ${!isActive ? "btn--primary" : ""}`}
    onClick={() => setIsActive(false)}
  >
    Inactive
  </button>
</div>
```

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```
Expected: Only the known missing `./components/calendar` error.

- [ ] **Step 4: Commit**

```bash
git add src/components/tables/ActivitiesTable.tsx src/components/modals/ActivityModalContent.tsx
git commit -m "feat: add active/inactive status to activities — badge, filter, modal toggle"
```

---

## Task 7: Programs — Rename Study Circles & Split Lists

**Files:**
- Modify: `src/components/panels/ProgramsPanel.tsx`

- [ ] **Step 1: Rename Study Circles in KINDS array**

In `src/components/panels/ProgramsPanel.tsx`, find the `KINDS` array and change the study-circle label:
```ts
const KINDS: { kind: ProgramKind; label: string; icon: string }[] = [
  { kind: "children-festival", label: "Children's Festivals", icon: "🎉" },
  { kind: "jy-intensive", label: "JY Intensives", icon: "⚡" },
  { kind: "study-circle", label: "Study Circle Intensives", icon: "📚" },
];
```

- [ ] **Step 2: Split eventsForKind into inProgress and completed**

After the `eventsForKind` declaration, add:
```ts
const inProgressEvents = eventsForKind.filter(
  (e) => e.status === "planned" || e.status === "ongoing",
);
const completedEvents = eventsForKind.filter(
  (e) => e.status === "completed" || e.status === "cancelled",
);
```

- [ ] **Step 3: Replace flat event list with two sections**

Find the `{/* Event cards */}` section in the JSX. Replace:
```tsx
{/* Event cards */}
<div
  style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
>
  {eventsForKind.map((event) => {
```
with a two-section layout. Replace the entire `{/* Event cards */}` block (from the `<div style={{ display: "flex"...` through the closing `</div>` of that div) with:

```tsx
{/* In Progress */}
{inProgressEvents.length > 0 && (
  <div style={{ marginBottom: "1.25rem" }}>
    <div style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: "0.5rem" }}>
      In Progress ({inProgressEvents.length})
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {inProgressEvents.map((event) => {
        const isExpanded = expandedId === event.id;
        const isDeleteConfirm = deleteConfirmId === event.id;
        return renderEventCard(event, isExpanded, isDeleteConfirm);
      })}
    </div>
  </div>
)}

{/* Completed / Cancelled */}
{completedEvents.length > 0 && (
  <div>
    <div style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: "0.5rem", marginTop: inProgressEvents.length > 0 ? "1rem" : 0 }}>
      Completed / Cancelled ({completedEvents.length})
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", opacity: 0.7 }}>
      {completedEvents.map((event) => {
        const isExpanded = expandedId === event.id;
        const isDeleteConfirm = deleteConfirmId === event.id;
        return renderEventCard(event, isExpanded, isDeleteConfirm);
      })}
    </div>
  </div>
)}
```

- [ ] **Step 4: Extract renderEventCard helper**

The existing `eventsForKind.map((event) => { ... })` block contains the card JSX. Extract it into a helper function inside the component, before the `return` statement. Add this function:

```tsx
const renderEventCard = (
  event: (typeof programEvents)[0],
  isExpanded: boolean,
  isDeleteConfirm: boolean,
) => (
  <div
    key={event.id}
    className="panel__section"
    style={{ padding: 0, overflow: "hidden" }}
  >
    {/* ... paste the entire existing card JSX here, removing the outer map wrapper ... */}
  </div>
);
```

Move the entire card JSX (the `<div key={event.id} className="panel__section"...>` block) into this function, replacing `event` references with the parameter.

- [ ] **Step 5: Split Learning Objects into active / completed sections**

In the `ObjectsOfLearningTab` component (or inline in `ProgramsPanel` if it's defined there), split `learningObjects` passed to it into two groups. If `ObjectsOfLearningTab` is a local component inside `ProgramsPanel.tsx`, add two props or compute inside. If it's rendered via the `sortedLearningObjects` variable, compute:

```ts
const activeObjects = sortedLearningObjects.filter((o) => o.status === "active");
const completedObjects = sortedLearningObjects.filter((o) => o.status === "completed");
```

In the `ObjectsOfLearningTab` JSX (wherever learning objects are mapped), add a section divider between active and completed items:
```tsx
{/* Active objects */}
{activeObjects.length > 0 && (
  <>
    <div style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: "0.5rem" }}>
      In Progress ({activeObjects.length})
    </div>
    {activeObjects.map((obj) => renderLearningObjectCard(obj))}
  </>
)}

{/* Completed objects */}
{completedObjects.length > 0 && (
  <>
    <div style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: "0.5rem", marginTop: activeObjects.length > 0 ? "1rem" : 0 }}>
      Completed ({completedObjects.length})
    </div>
    <div style={{ opacity: 0.7 }}>
      {completedObjects.map((obj) => renderLearningObjectCard(obj))}
    </div>
  </>
)}
```

Where `renderLearningObjectCard(obj)` is the existing per-object JSX extracted into a helper.

- [ ] **Step 6: Run type-check**

```bash
npm run type-check
```
Expected: Only the known missing `./components/calendar` error.

- [ ] **Step 7: Commit**

```bash
git add src/components/panels/ProgramsPanel.tsx
git commit -m "feat: programs — rename Study Circle Intensives, split events into in-progress/completed"
```

---

## Task 8: Analytics — GrowthOverTime Component

**Files:**
- Create: `src/components/analytics/GrowthOverTime.tsx`
- Modify: `src/components/analytics/Analytics.tsx`

- [ ] **Step 1: Create GrowthOverTime.tsx**

Create `src/components/analytics/GrowthOverTime.tsx`:

```tsx
import React, { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Person, Activity } from "../../types";
import { MetricsCard } from "./MetricsCard";

interface GrowthOverTimeProps {
  people: Person[];
  activities: Activity[];
}

interface MonthData {
  label: string;
  newPeople: number;
  newActivities: number;
}

function getLast6Months(people: Person[], activities: Activity[]): MonthData[] {
  const now = new Date();
  const result: MonthData[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    const year = d.getFullYear();
    const month = d.getMonth();
    const newPeople = people.filter((p) => {
      const added = new Date(p.dateAdded);
      return added.getFullYear() === year && added.getMonth() === month;
    }).length;
    const newActivities = activities.filter((a) => {
      const created = new Date(a.dateCreated);
      return created.getFullYear() === year && created.getMonth() === month;
    }).length;
    result.push({ label, newPeople, newActivities });
  }
  return result;
}

export const GrowthOverTime = memo(
  ({ people, activities }: GrowthOverTimeProps) => {
    const data = getLast6Months(people, activities);

    const now = new Date();
    const thisMonth = people.filter((p) => {
      const added = new Date(p.dateAdded);
      return (
        added.getFullYear() === now.getFullYear() &&
        added.getMonth() === now.getMonth()
      );
    }).length;

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = people.filter((p) => {
      const added = new Date(p.dateAdded);
      return (
        added.getFullYear() === lastMonthDate.getFullYear() &&
        added.getMonth() === lastMonthDate.getMonth()
      );
    }).length;

    const delta = thisMonth - lastMonth;
    const pctChange =
      lastMonth > 0 ? Math.round((delta / lastMonth) * 1000) / 10 : null;

    const activeActivities = activities.filter((a) => a.isActive !== false).length;
    const last3 = data.slice(-3);

    return (
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Growth Over Time</h3>
        <div className="analytics__summary">
          {/* Real-time panel */}
          <MetricsCard title="This Month" icon="📈">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div>
                <strong style={{ fontSize: "1.8rem" }}>{thisMonth}</strong>
                <span className="muted"> new people</span>
              </div>
              <div
                style={{
                  color:
                    delta > 0 ? "#16a34a" : delta < 0 ? "#dc2626" : "#6b7280",
                  fontSize: "0.9rem",
                }}
              >
                {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}{" "}
                {pctChange !== null
                  ? `${Math.abs(pctChange)}% vs last month`
                  : "vs last month"}
              </div>
              <div className="muted">Active activities: {activeActivities}</div>
            </div>
          </MetricsCard>

          {/* Month-to-month table */}
          <MetricsCard title="Recent Months" icon="📅">
            <table
              style={{
                width: "100%",
                fontSize: "0.85rem",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      paddingBottom: "0.4rem",
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    Month
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      paddingBottom: "0.4rem",
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    People
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      paddingBottom: "0.4rem",
                      color: "var(--muted)",
                      fontWeight: 500,
                    }}
                  >
                    Activities
                  </th>
                </tr>
              </thead>
              <tbody>
                {last3.map((m, i) => {
                  const prev = i > 0 ? last3[i - 1].newPeople : null;
                  const pct =
                    prev !== null && prev > 0
                      ? Math.round(((m.newPeople - prev) / prev) * 100)
                      : null;
                  return (
                    <tr key={m.label}>
                      <td style={{ padding: "0.25rem 0" }}>{m.label}</td>
                      <td style={{ textAlign: "right" }}>
                        {m.newPeople}
                        {pct !== null && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              marginLeft: "0.3rem",
                              color: pct >= 0 ? "#16a34a" : "#dc2626",
                            }}
                          >
                            {pct >= 0 ? `+${pct}` : pct}%
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>{m.newActivities}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </MetricsCard>

          {/* 6-month bar chart */}
          <MetricsCard title="6-Month Trend" icon="📊">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={data}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                <Bar
                  dataKey="newPeople"
                  name="People"
                  fill="#4f46e5"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="newActivities"
                  name="Activities"
                  fill="#0d9488"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </MetricsCard>
        </div>
      </div>
    );
  },
);

GrowthOverTime.displayName = "GrowthOverTime";
```

- [ ] **Step 2: Add GrowthOverTime to Analytics.tsx**

In `src/components/analytics/Analytics.tsx`, add the import after the existing analytics imports:
```tsx
import { GrowthOverTime } from "./GrowthOverTime";
```

In the `AnalyticsContent` component JSX, add `<GrowthOverTime>` as the first element inside `<div className="analytics">`, before the `<h2>Community Overview</h2>`:
```tsx
return (
  <div className="analytics">
    <GrowthOverTime people={people} activities={activities} />
    <h2>Community Overview</h2>
    ...
```

- [ ] **Step 3: Run type-check**

```bash
npm run type-check
```
Expected: Only the known missing `./components/calendar` error.

- [ ] **Step 4: Commit**

```bash
git add src/components/analytics/GrowthOverTime.tsx src/components/analytics/Analytics.tsx
git commit -m "feat: add Growth Over Time section to Analytics — real-time, M2M, 6-month chart"
```

---

## Task 9: iCal Parser Utility

**Files:**
- Create: `src/utils/icsParser.ts`

- [ ] **Step 1: Create icsParser.ts**

Create `src/utils/icsParser.ts`:

```ts
export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end?: Date;
  description?: string;
}

/**
 * Parses a raw .ics (iCalendar) string into CalendarEvent objects.
 * Handles line folding (CRLF + space/tab continuation).
 * Supports DTSTART with date-only, datetime, and timezone formats.
 */
export function parseICS(text: string): CalendarEvent[] {
  // Unfold continuation lines (RFC 5545: CRLF + space/tab = continuation)
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const events: CalendarEvent[] = [];
  let current: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
    } else if (line === "END:VEVENT") {
      if (current?.summary && current?.start) {
        events.push({
          id: current.id ?? Math.random().toString(36).slice(2),
          summary: current.summary,
          start: current.start,
          end: current.end,
          description: current.description,
        });
      }
      current = null;
    } else if (current !== null) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).toUpperCase();
      const value = line.slice(colonIdx + 1);

      if (key === "SUMMARY") {
        current.summary = value.trim();
      } else if (key.startsWith("DTSTART")) {
        current.start = parseICSDate(value);
      } else if (key.startsWith("DTEND")) {
        current.end = parseICSDate(value);
      } else if (key === "DESCRIPTION") {
        current.description = value
          .replace(/\\n/g, "\n")
          .replace(/\\,/g, ",")
          .replace(/\\;/g, ";")
          .trim();
      } else if (key === "UID") {
        current.id = value.trim();
      }
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function parseICSDate(value: string): Date {
  // Strip trailing Z (UTC marker) then remove T separator
  const clean = value.replace(/Z$/, "").replace("T", "");
  if (clean.length === 8) {
    // DATE only: YYYYMMDD
    const y = parseInt(clean.slice(0, 4), 10);
    const mo = parseInt(clean.slice(4, 6), 10) - 1;
    const d = parseInt(clean.slice(6, 8), 10);
    return new Date(y, mo, d);
  }
  // DATETIME: YYYYMMDDHHMMSS (14 chars)
  const y = parseInt(clean.slice(0, 4), 10);
  const mo = parseInt(clean.slice(4, 6), 10) - 1;
  const d = parseInt(clean.slice(6, 8), 10);
  const h = parseInt(clean.slice(8, 10) || "0", 10);
  const mi = parseInt(clean.slice(10, 12) || "0", 10);
  return new Date(y, mo, d, h, mi);
}
```

- [ ] **Step 2: Run type-check**

```bash
npm run type-check
```
Expected: Only the known missing `./components/calendar` error.

- [ ] **Step 3: Commit**

```bash
git add src/utils/icsParser.ts
git commit -m "feat: add iCal parser utility for .ics calendar feeds"
```

---

## Task 10: Calendar View Component

**Files:**
- Create: `src/components/calendar/CalendarView.tsx`
- Create: `src/components/calendar/index.ts`

This resolves the missing module error from Task 3 and completes the feature.

- [ ] **Step 1: Create CalendarView.tsx**

Create `src/components/calendar/CalendarView.tsx`:

```tsx
import React, { useState, useEffect } from "react";
import { useApp } from "../../context";
import { parseICS, CalendarEvent } from "../../utils/icsParser";

function groupByMonth(events: CalendarEvent[]): [string, CalendarEvent[]][] {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = event.start.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(event);
  }
  return Array.from(groups.entries());
}

export const CalendarView: React.FC = () => {
  const { calendarUrl, setCalendarUrl } = useApp();
  const [urlInput, setUrlInput] = useState(calendarUrl || "");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  const fetchCalendar = async (url: string) => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      setEvents(parseICS(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (calendarUrl) fetchCalendar(calendarUrl);
  }, [calendarUrl]);

  const handleSaveUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setCalendarUrl(trimmed);
  };

  const now = new Date();
  const visibleEvents = showPast
    ? events
    : events.filter((e) => {
        const end = e.end ?? e.start;
        return end >= now;
      });
  const grouped = groupByMonth(visibleEvents);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "700px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "0.25rem" }}>Bahai Calendar</h2>
      <p className="muted" style={{ marginBottom: "1.25rem" }}>
        Upcoming holy days and community events
      </p>

      {/* URL input */}
      <div className="panel__section" style={{ marginBottom: "1.5rem" }}>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem" }}
        >
          Google Calendar iCal URL
        </label>
        <p
          className="muted"
          style={{ marginBottom: "0.5rem", fontSize: "0.82rem" }}
        >
          In Google Calendar: open calendar settings → "Secret address in iCal
          format" → copy and paste here.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="url"
            className="form-input"
            style={{ flex: 1, minWidth: "200px" }}
            placeholder="https://calendar.google.com/calendar/ical/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveUrl()}
          />
          <button
            className="btn btn--primary btn--sm"
            onClick={handleSaveUrl}
            disabled={!urlInput.trim()}
          >
            Save & Fetch
          </button>
          {calendarUrl && (
            <button
              className="btn btn--sm"
              onClick={() => fetchCalendar(calendarUrl)}
              disabled={loading}
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <p className="muted">Loading calendar...</p>}

      {/* Error */}
      {error && (
        <div
          style={{
            color: "var(--danger)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span>Error: {error}</span>
          <button
            className="btn btn--sm"
            onClick={() => calendarUrl && fetchCalendar(calendarUrl)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Events */}
      {!loading && !error && events.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "0.75rem",
            }}
          >
            <button
              className="btn btn--sm"
              onClick={() => setShowPast((p) => !p)}
            >
              {showPast ? "Hide past events" : "Show past events"}
            </button>
          </div>

          {visibleEvents.length === 0 ? (
            <p className="muted">No upcoming events.</p>
          ) : (
            grouped.map(([month, monthEvents]) => (
              <div key={month} style={{ marginBottom: "1.25rem" }}>
                <h3
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  {month}
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {monthEvents.map((event) => (
                    <div
                      key={event.id}
                      className="panel__section"
                      style={{ padding: "0.75rem 1rem" }}
                    >
                      <div style={{ fontWeight: 600 }}>{event.summary}</div>
                      <div
                        className="muted"
                        style={{ fontSize: "0.82rem", marginTop: "0.2rem" }}
                      >
                        {event.start.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {event.end &&
                          event.end.toDateString() !==
                            event.start.toDateString() && (
                            <span>
                              {" "}
                              –{" "}
                              {event.end.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                      </div>
                      {event.description && (
                        <div
                          style={{
                            fontSize: "0.82rem",
                            marginTop: "0.4rem",
                            color: "var(--text)",
                          }}
                        >
                          {event.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* Empty states */}
      {!loading && !error && calendarUrl && events.length === 0 && (
        <p className="muted">No events found in this calendar.</p>
      )}
      {!calendarUrl && !loading && (
        <p className="muted">
          Paste a Google Calendar iCal URL above to see events.
        </p>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Create barrel export**

Create `src/components/calendar/index.ts`:
```ts
export { CalendarView } from "./CalendarView";
```

- [ ] **Step 3: Run type-check — expect clean**

```bash
npm run type-check
```
Expected: **No errors.** This resolves the last remaining missing module error from Task 3.

- [ ] **Step 4: Visual test**

```bash
npm run dev
```
- Click the Calendar tab — should show the URL input prompt
- Paste a public `.ics` URL (e.g., a public Google Calendar Bahai holy days link) and click Save & Fetch
- Confirm events appear grouped by month
- Confirm "Show past events" toggle works
- Confirm Refresh button re-fetches

- [ ] **Step 5: Commit**

```bash
git add src/components/calendar/CalendarView.tsx src/components/calendar/index.ts
git commit -m "feat: add Bahai Calendar tab with iCal URL import and event display"
```

---

## Self-Review Checklist

After all tasks complete, verify:

- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run dev` shows the light theme (white background, dark text)
- [ ] Home Visits tab is gone from navigation
- [ ] Calendar tab appears and works with an iCal URL
- [ ] Forms tab shows only "New Person"
- [ ] Activities table has Active/Inactive badge + filter
- [ ] Activity edit modal has Active/Inactive toggle
- [ ] Programs → Study Circle tab is labeled "Study Circle Intensives"
- [ ] Programs events split into In Progress / Completed sections
- [ ] Learning Objects split into In Progress / Completed sections
- [ ] Analytics tab shows Growth Over Time section at top with 3 panels
- [ ] Growth bar chart renders correctly using recharts

---

## Spec → Task Coverage

| Spec Section | Task |
|---|---|
| Navigation: remove Home Visits | Task 3 |
| Navigation: add Calendar tab | Task 3 |
| Forms: remove Home Visit Report | Task 4 |
| Light UI theme | Task 5 |
| Activities isActive badge + filter | Task 6 |
| Activities isActive modal toggle | Task 6 |
| Programs rename Study Circle Intensives | Task 7 |
| Programs in-progress/completed split | Task 7 |
| Learning Objects in-progress/completed split | Task 7 |
| Analytics Growth Over Time | Task 8 |
| iCal parser | Task 9 |
| Calendar tab view | Task 10 |
| Type foundation | Task 1 |
| AppContext calendarUrl | Task 2 |
