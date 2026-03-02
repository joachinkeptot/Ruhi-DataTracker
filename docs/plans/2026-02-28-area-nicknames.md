# Area Nicknames Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users assign friendly nicknames to areas (e.g. "The Smith House" for "123 E Colfax Ave"), stored globally so all people at that area share the same nickname.

**Architecture:** Add `areaNicknames: Record<string, string>` to `AppState` / `SerializableState`, wire it through `AppContext` with an `updateAreaNickname` action, then display nicknames in the map popup (with an inline edit UI) and the people table area column.

**Tech Stack:** React 18 + TypeScript + Vite + Electron; no test runner configured — verification is manual in the browser.

---

### Task 1: Add `areaNicknames` to types

**Files:**
- Modify: `src/types/index.ts`

**Step 1: Add field to `AppState`**

Find the `AppState` interface (around line 302) and add the new field:

```ts
// Application state
export interface AppState {
  families: Family[];
  people: Person[];
  activities: Activity[];
  programEvents: ProgramEvent[];
  learningObjects: LearningObject[];
  reflections: Reflection[];
  attendanceRecords?: AttendanceRecord[];

  areaNicknames: Record<string, string>; // ← ADD THIS LINE

  // UI State
  selected: SelectedItem;
  ...
```

**Step 2: Add optional field to `SerializableState`**

Find `SerializableState` (around line 371) and add:

```ts
export interface SerializableState {
  people: Person[];
  activities: Activity[];
  families: Family[];
  programEvents?: ProgramEvent[];
  learningObjects?: LearningObject[];
  reflections?: Reflection[];
  attendanceRecords?: AttendanceRecord[];

  areaNicknames?: Record<string, string>; // ← ADD THIS LINE (optional for backward compat)

  selected: SelectedItem;
  ...
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 4: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add areaNicknames to AppState and SerializableState types"
```

---

### Task 2: Wire `areaNicknames` through AppContext

**Files:**
- Modify: `src/context/AppContext.tsx`

**Step 1: Add `updateAreaNickname` to `AppContextType`**

Find the `AppContextType` interface (lines 25–59) and add to the end of it, before the closing `}`:

```ts
  updateAreaNickname: (area: string, nickname: string) => void;
```

Also add `areaNicknames` — it's inherited from `AppState` via `extends AppState`, so it's already included automatically.

**Step 2: Add state variable**

In `AppProvider`, after the existing `useState` declarations (around line 83), add:

```ts
  const [areaNicknames, setAreaNicknames] = useState<Record<string, string>>({});
```

**Step 3: Load from localStorage**

In the load effect (around line 99), after `setShowConnectionsState(savedData.showConnections ?? false);`, add:

```ts
      setAreaNicknames(savedData.areaNicknames ?? {});
```

**Step 4: Add to save effect state object**

In the save effect (around line 130), add `areaNicknames` to the state object being saved:

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
          areaNicknames, // ← ADD THIS
        };
```

**Step 5: Add `areaNicknames` to the save effect dependency array**

Around line 159, add `areaNicknames` to the deps array:

```ts
  }, [
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
    areaNicknames, // ← ADD THIS
  ]);
```

**Step 6: Implement `updateAreaNickname` function**

Add the function after `importData` (around line 338):

```ts
  const updateAreaNickname = (area: string, nickname: string) => {
    setAreaNicknames((prev) => {
      const next = { ...prev };
      if (nickname) {
        next[area] = nickname;
      } else {
        delete next[area];
      }
      return next;
    });
  };
```

**Step 7: Add to value object**

In the `value` object (around line 340), add:

```ts
    areaNicknames,
    updateAreaNickname,
```

**Step 8: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 9: Commit**

```bash
git add src/context/AppContext.tsx
git commit -m "feat: add areaNicknames state and updateAreaNickname to AppContext"
```

---

### Task 3: Update MapView — tooltip + popup with inline nickname editing

**Files:**
- Modify: `src/components/map/MapView.tsx`

**Step 1: Destructure `areaNicknames` and `updateAreaNickname` from `useApp()`**

Find the line (around 321):

```ts
  const { people: allPeople, activities, updatePerson, updateActivity } = useApp();
```

Change to:

```ts
  const { people: allPeople, activities, updatePerson, updateActivity, areaNicknames, updateAreaNickname } = useApp();
```

**Step 2: Add nickname edit state**

After the existing `const [editingArea, setEditingArea]` state (around line 324), add:

```ts
  const [nicknameEditArea, setNicknameEditArea] = useState<string | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState("");
```

**Step 3: Update the people pin Tooltip to show nickname**

Find the Tooltip inside the people pins CircleMarker (around line 598):

```tsx
              <Tooltip direction="top" offset={[0, -8]}>
                <strong>{pin.area}</strong>
                {" · "}
                {pin.people.length}{" "}
                {pin.people.length === 1 ? "person" : "people"}
              </Tooltip>
```

Replace with:

```tsx
              <Tooltip direction="top" offset={[0, -8]}>
                <strong>{areaNicknames[pin.area] || pin.area}</strong>
                {" · "}
                {pin.people.length}{" "}
                {pin.people.length === 1 ? "person" : "people"}
              </Tooltip>
```

**Step 4: Update the people pin Popup title to show nickname**

Find the Popup header (around line 605):

```tsx
                  <strong style={{ fontSize: 14 }}>{pin.area}</strong>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6, marginTop: 2 }}>
```

Replace just the `<strong>` line and the subtitle div with:

```tsx
                  {areaNicknames[pin.area] ? (
                    <>
                      <strong style={{ fontSize: 14 }}>{areaNicknames[pin.area]}</strong>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{pin.area}</div>
                    </>
                  ) : (
                    <strong style={{ fontSize: 14 }}>{pin.area}</strong>
                  )}
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6, marginTop: 2 }}>
```

**Step 5: Add nickname editing UI inside the Popup**

Find the closing `</div>` of the popup's outer div (the one right before `</Popup>`, around line 735):

```tsx
                </div>
              </Popup>
```

Insert the nickname section before that closing `</div>`:

```tsx
                  {/* Nickname */}
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                      Area nickname
                    </div>
                    {nicknameEditArea === pin.area ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        <input
                          type="text"
                          value={nicknameDraft}
                          onChange={(e) => setNicknameDraft(e.target.value)}
                          placeholder="e.g. The Smith House"
                          style={{ flex: 1, fontSize: 11, padding: "2px 6px", border: "1px solid #d1d5db", borderRadius: 4 }}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateAreaNickname(pin.area, nicknameDraft.trim());
                              setNicknameEditArea(null);
                            } else if (e.key === "Escape") {
                              setNicknameEditArea(null);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            updateAreaNickname(pin.area, nicknameDraft.trim());
                            setNicknameEditArea(null);
                          }}
                          style={{ fontSize: 11, padding: "2px 8px", background: "#6366f1", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setNicknameEditArea(null)}
                          style={{ fontSize: 11, padding: "2px 6px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer" }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: areaNicknames[pin.area] ? "#374151" : "#9ca3af" }}>
                          {areaNicknames[pin.area] || "No nickname set"}
                        </span>
                        <button
                          onClick={() => {
                            setNicknameDraft(areaNicknames[pin.area] || "");
                            setNicknameEditArea(pin.area);
                          }}
                          style={{ fontSize: 10, padding: "1px 6px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        {areaNicknames[pin.area] && (
                          <button
                            onClick={() => updateAreaNickname(pin.area, "")}
                            style={{ fontSize: 10, padding: "1px 6px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", color: "#9ca3af" }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
```

**Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 7: Manual test in browser**

1. Run `npm run dev` and open the app
2. Go to Map view
3. Click a pin — popup opens. Confirm "Area nickname" section appears at the bottom
4. Click "Edit", type a nickname, press Enter or click Save
5. Popup shows the nickname in bold, raw area in small grey text below
6. Tooltip (hover) shows the nickname instead of raw area
7. Click "Clear" — nickname is removed, tooltip reverts to raw area
8. Reload the page — nickname persists (stored via AppContext/localStorage)

**Step 8: Commit**

```bash
git add src/components/map/MapView.tsx
git commit -m "feat: show area nicknames in map tooltip and popup with inline edit"
```

---

### Task 4: Show nicknames in People Table area column

**Files:**
- Modify: `src/components/tables/PeopleTable.tsx`

**Step 1: Import `useApp`**

At the top of the file, add the import:

```ts
import { useApp } from "../../context";
```

**Step 2: Destructure `areaNicknames` inside the component**

Inside `PeopleTable` component body, right after the `const familyMap = ...` line (around line 37), add:

```ts
  const { areaNicknames } = useApp();
```

**Step 3: Update area cell in regular people view**

Find the area cell in the regular view (around line 154):

```tsx
                    <td>{person.area || "-"}</td>
```

Replace with:

```tsx
                    <td title={areaNicknames[person.area ?? ""] ? person.area : undefined}>
                      {areaNicknames[person.area ?? ""] || person.area || "-"}
                    </td>
```

**Step 4: Update area cell in cohorts view**

Find the same cell in the cohorts view (around line 103):

```tsx
                        <td>{person.area || "-"}</td>
```

Replace with the same pattern:

```tsx
                        <td title={areaNicknames[person.area ?? ""] ? person.area : undefined}>
                          {areaNicknames[person.area ?? ""] || person.area || "-"}
                        </td>
```

**Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

**Step 6: Manual test in browser**

1. Set a nickname for an area on the map (Task 3 must be done first)
2. Go to People view
3. Confirm the area column shows the nickname for people with that area
4. Hover the cell — browser tooltip shows the raw area string

**Step 7: Commit**

```bash
git add src/components/tables/PeopleTable.tsx
git commit -m "feat: display area nicknames in people table area column"
```
