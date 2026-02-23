# Map Demographics & Statistics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add US Census demographic data (population, race breakdown, median income) and app-derived stats (age group breakdown, home visit coverage) to the map view — shown in the popup per area and as an aggregate summary in the sidebar.

**Architecture:** All changes are confined to `src/components/map/MapView.tsx`. After geocoding an area to lat/lng, a new census-fetch effect resolves each lat/lng to a Census tract via the Census Geocoder API, then fetches ACS 5-year estimates for that tract. Results are cached in `localStorage` under `roommap_census_cache`. App-derived stats are computed inline from the existing `people`/`activities` arrays.

**Tech Stack:** React 18 + TypeScript, react-leaflet, US Census Geocoder API (free, no key), US Census ACS 5-year API (free, no key), localStorage for caching.

---

## Reference

- **Only file modified:** `src/components/map/MapView.tsx`
- **Design doc:** `docs/plans/2026-02-22-map-demographics-design.md`
- **Census Geocoder:** `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x={lng}&y={lat}&benchmark=Public_AR_Census2020&vintage=Census2020_Census2020&layers=10&format=json`
- **ACS 5-year API:** `https://api.census.gov/data/2023/acs/acs5?get=B01003_001E,B02001_002E,B02001_003E,B02001_004E,B02001_005E,B02001_006E,B02001_007E,B02001_008E,B19013_001E&for=tract:{tract}&in=state:{state}+county:{county}`

---

### Task 1: Add CensusData types and cache helpers

**Files:**
- Modify: `src/components/map/MapView.tsx` (top of file, after existing interfaces)

**Step 1: Add the `CensusData` interface and `CensusCache` type after the existing `GeoCache` type (~line 35)**

```ts
interface RaceBreakdown {
  label: string;
  count: number;
}

interface CensusData {
  tractPop: number;
  races: RaceBreakdown[]; // sorted descending by count, filtered to count > 0
  medianIncome: number | null; // null if census returns -666666666 (N/A)
}

type CensusCache = { [area: string]: CensusData | null };
```

**Step 2: Add the cache constant and helpers after the existing `GEO_CACHE_KEY` constant and `saveGeoCache` helper**

```ts
const CENSUS_CACHE_KEY = "roommap_census_cache";

function loadCensusCache(): CensusCache {
  try {
    const raw = localStorage.getItem(CENSUS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as CensusCache) : {};
  } catch {
    return {};
  }
}

function saveCensusCache(cache: CensusCache) {
  try {
    localStorage.setItem(CENSUS_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}
```

**Step 3: Run the dev server and confirm no TypeScript errors**

```bash
npm run dev
```
Expected: Server starts, no TS errors in terminal.

---

### Task 2: Add census-fetching functions

**Files:**
- Modify: `src/components/map/MapView.tsx` (after the `sleep` helper, before color helpers)

**Step 1: Add the two census fetch functions**

```ts
// Resolves lat/lng → { state, county, tract } FIPS codes via Census Geocoder
async function fetchCensusTract(
  lat: number,
  lng: number
): Promise<{ state: string; county: string; tract: string } | null> {
  try {
    const url =
      `https://geocoding.geo.census.gov/geocoder/geographies/coordinates` +
      `?x=${lng}&y=${lat}` +
      `&benchmark=Public_AR_Census2020` +
      `&vintage=Census2020_Census2020` +
      `&layers=10&format=json`;
    const res = await fetch(url);
    const json = await res.json();
    const tracts: any[] =
      json?.result?.geographies?.["Census Tracts"] ?? [];
    if (tracts.length === 0) return null;
    const t = tracts[0];
    return {
      state: t.STATE,
      county: t.COUNTY,
      tract: t.TRACT,
    };
  } catch {
    return null;
  }
}

// Fetches ACS 5-year demographics for a given census tract
async function fetchACSData(
  state: string,
  county: string,
  tract: string
): Promise<CensusData | null> {
  const fields = [
    "B01003_001E", // total pop
    "B02001_002E", // white
    "B02001_003E", // black
    "B02001_004E", // AIAN
    "B02001_005E", // asian
    "B02001_006E", // NHPI
    "B02001_007E", // other
    "B02001_008E", // two or more
    "B19013_001E", // median income
  ].join(",");
  try {
    const url =
      `https://api.census.gov/data/2023/acs/acs5` +
      `?get=${fields}` +
      `&for=tract:${tract}` +
      `&in=state:${state}+county:${county}`;
    const res = await fetch(url);
    const json: string[][] = await res.json();
    if (!Array.isArray(json) || json.length < 2) return null;
    const [header, row] = [json[0], json[1]];
    const get = (field: string) => parseInt(row[header.indexOf(field)] ?? "-1", 10);

    const tractPop = get("B01003_001E");
    const income = get("B19013_001E");

    const RACE_LABELS: { field: string; label: string }[] = [
      { field: "B02001_002E", label: "White" },
      { field: "B02001_003E", label: "Black / African American" },
      { field: "B02001_004E", label: "American Indian / Alaska Native" },
      { field: "B02001_005E", label: "Asian" },
      { field: "B02001_006E", label: "Native Hawaiian / Pacific Islander" },
      { field: "B02001_007E", label: "Other race" },
      { field: "B02001_008E", label: "Two or more races" },
    ];

    const races: RaceBreakdown[] = RACE_LABELS.map(({ field, label }) => ({
      label,
      count: Math.max(0, get(field)),
    }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      tractPop: Math.max(0, tractPop),
      races,
      medianIncome: income > 0 ? income : null,
    };
  } catch {
    return null;
  }
}
```

**Step 2: Run the dev server and confirm no TS errors**

```bash
npm run dev
```
Expected: No errors.

---

### Task 3: Wire up census-fetching state and effect

**Files:**
- Modify: `src/components/map/MapView.tsx` (inside `MapView` component, after existing state declarations)

**Step 1: Add census state variables after the existing `geocodedCount` state (~line 149)**

```ts
const [censusCache, setCensusCache] = useState<CensusCache>(() => loadCensusCache());
const [censusStatus, setCensusStatus] = useState<"idle" | "loading" | "done">("idle");
```

**Step 2: Add the census-fetch effect after the existing geocoding effect (~line 238)**

This effect runs whenever `geoCache` updates (i.e., after areas get lat/lng). It fetches census data for any areas that have coordinates but no census data yet.

```ts
// Census-fetch effect: runs after geo cache has coordinates
useEffect(() => {
  // Only fetch for areas that are geocoded but not yet in census cache
  const areasToFetch = peoplePins
    .map((p) => p.area)
    .filter((area) => !(area in censusCache));

  if (areasToFetch.length === 0) {
    setCensusStatus("done");
    return;
  }

  let aborted = false;
  let localCache = { ...censusCache };

  async function run() {
    setCensusStatus("loading");
    for (const area of areasToFetch) {
      if (aborted) return;
      const coords = geoCache[area];
      if (!coords) {
        localCache = { ...localCache, [area]: null };
        continue;
      }
      const tractInfo = await fetchCensusTract(coords.lat, coords.lng);
      if (aborted) return;
      if (!tractInfo) {
        localCache = { ...localCache, [area]: null };
        saveCensusCache(localCache);
        setCensusCache({ ...localCache });
        continue;
      }
      const data = await fetchACSData(tractInfo.state, tractInfo.county, tractInfo.tract);
      if (aborted) return;
      localCache = { ...localCache, [area]: data };
      saveCensusCache(localCache);
      setCensusCache({ ...localCache });
    }
    if (!aborted) setCensusStatus("done");
  }

  run();
  return () => { aborted = true; };
}, [peoplePins.length, geoCache]); // eslint-disable-line react-hooks/exhaustive-deps
```

**Step 3: Update `handleRefresh` to also clear the census cache**

Find the existing `handleRefresh` function and add the census cache clear:

```ts
const handleRefresh = () => {
  localStorage.removeItem(GEO_CACHE_KEY);
  localStorage.removeItem(CENSUS_CACHE_KEY); // add this line
  setGeoCache({});
  setCensusCache({});   // add this line
  setGeocodedCount(0);
  setGeocodingStatus("idle");
  setCensusStatus("idle"); // add this line
  setTimeout(() => setRefreshKey((k) => k + 1), 50);
};
```

**Step 4: Run dev server and verify no errors**

```bash
npm run dev
```

Open the map tab in the browser. Open devtools → Network tab. After geocoding completes, you should see requests to `geocoding.geo.census.gov` and `api.census.gov`.

---

### Task 4: Show census data in the people pin popup

**Files:**
- Modify: `src/components/map/MapView.tsx` (the people pin `<Popup>` block, ~lines 297–325)

**Step 1: Replace the existing people pin `<Popup>` content**

Find the `<Popup>` inside the people pins `.map()` block and replace its contents:

```tsx
<Popup>
  <div style={{ minWidth: 200 }}>
    <strong style={{ fontSize: 14 }}>{pin.area}</strong>
    <div style={{ fontSize: 12, color: "#666", marginBottom: 6, marginTop: 2 }}>
      {pin.people.length} {pin.people.length === 1 ? "person" : "people"} in your database
    </div>
    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, lineHeight: 1.7 }}>
      {pin.people.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>

    {/* App stats — age groups in this area */}
    {(() => {
      const areapeople = allPeople.filter((p) => p.area?.trim() === pin.area);
      const grouped: Record<string, number> = {};
      for (const p of areapeople) {
        grouped[p.ageGroup] = (grouped[p.ageGroup] ?? 0) + 1;
      }
      const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) return null;
      return (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
            Age groups
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {entries.map(([group, count]) => (
              <span
                key={group}
                style={{
                  background: "#f3f4f6",
                  borderRadius: 4,
                  padding: "1px 6px",
                  fontSize: 11,
                  color: "#374151",
                }}
              >
                {group}: {count}
              </span>
            ))}
          </div>
        </div>
      );
    })()}

    {/* Activities in this area */}
    {(() => {
      const areaActivities = activities.filter((a) => a.area?.trim() === pin.area);
      if (areaActivities.length === 0) return null;
      return (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
            Activities ({areaActivities.length})
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            {areaActivities.map((a) => a.name).join(", ")}
          </div>
        </div>
      );
    })()}

    {/* Census demographics */}
    {(() => {
      const census = censusCache[pin.area];
      if (census === undefined) {
        return (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee", fontSize: 11, color: "#9ca3af" }}>
            Loading neighborhood demographics…
          </div>
        );
      }
      if (census === null) {
        return (
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee", fontSize: 11, color: "#9ca3af" }}>
            No census data available for this area
          </div>
        );
      }
      const topRaces = census.races.slice(0, 4);
      return (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Census tract demographics
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
            Tract population: <strong style={{ color: "#374151" }}>{census.tractPop.toLocaleString()}</strong>
          </div>
          {census.medianIncome !== null && (
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>
              Median household income: <strong style={{ color: "#374151" }}>${census.medianIncome.toLocaleString()}</strong>
            </div>
          )}
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>Race breakdown:</div>
          {topRaces.map((r) => {
            const pct = census.tractPop > 0 ? Math.round((r.count / census.tractPop) * 100) : 0;
            return (
              <div key={r.label} style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#374151" }}>
                  <span>{r.label}</span>
                  <span style={{ fontWeight: 600 }}>{pct}%</span>
                </div>
                <div style={{ background: "#e5e7eb", borderRadius: 3, height: 4, marginTop: 2 }}>
                  <div
                    style={{
                      background: "#6366f1",
                      borderRadius: 3,
                      height: 4,
                      width: `${pct}%`,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            );
          })}
          {census.races.length > 4 && (
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
              +{census.races.length - 4} more groups
            </div>
          )}
        </div>
      );
    })()}
  </div>
</Popup>
```

**Step 2: Run dev server, click a people pin, verify popup renders all sections**

```bash
npm run dev
```

- People list → visible immediately
- Age groups → visible immediately
- Activities → visible if area has activities
- Census section → shows "Loading…" then populates after fetch

---

### Task 5: Add aggregate stats summary section to the sidebar

**Files:**
- Modify: `src/components/map/MapView.tsx` (sidebar, after the existing `{/* Stats */}` block and before the activity toggle, ~line 496)

**Step 1: Compute aggregate stats before the return statement**

Add these computed values inside the `MapView` component, before the `return`:

```ts
// Aggregate app stats across all visible (filtered) people
const ageGroupCounts = useMemo(() => {
  const counts: Record<string, number> = {};
  for (const p of filteredPeople) {
    counts[p.ageGroup] = (counts[p.ageGroup] ?? 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}, [filteredPeople]);

const homeVisitCoverage = useMemo(() => {
  const withVisits = filteredPeople.filter((p) => p.homeVisits && p.homeVisits.length > 0).length;
  return { withVisits, total: filteredPeople.length };
}, [filteredPeople]);

const visibleAreaActivityCount = useMemo(() => {
  const visibleAreaSet = new Set(filteredPeople.map((p) => p.area?.trim()).filter(Boolean));
  return activities.filter((a) => a.area?.trim() && visibleAreaSet.has(a.area.trim())).length;
}, [filteredPeople, activities]);
```

**Step 2: Add the summary section in the sidebar JSX, between the existing Stats block and the activity toggle**

Find the sidebar's `{/* Activity toggle */}` comment and insert before it:

```tsx
{/* App stats summary */}
{filteredPeople.length > 0 && (
  <div
    style={{
      background: "var(--panel-2, #f4efea)",
      borderRadius: 8,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    <div style={{ fontWeight: 600, fontSize: 12, color: "#374151", marginBottom: 2 }}>
      Community snapshot
    </div>

    {/* Age groups */}
    {ageGroupCounts.length > 0 && (
      <div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 3 }}>Age groups</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {ageGroupCounts.map(([group, count]) => (
            <span
              key={group}
              style={{
                background: "#e5e7eb",
                borderRadius: 10,
                padding: "1px 7px",
                fontSize: 11,
                color: "#374151",
                fontWeight: 500,
              }}
            >
              {group}: {count}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Home visit coverage */}
    <div style={{ fontSize: 11, color: "#6b7280" }}>
      Home visits:{" "}
      <strong style={{ color: "#374151" }}>
        {homeVisitCoverage.withVisits}/{homeVisitCoverage.total}
      </strong>{" "}
      people
      {homeVisitCoverage.total > 0 && (
        <span style={{ color: "#9ca3af" }}>
          {" "}({Math.round((homeVisitCoverage.withVisits / homeVisitCoverage.total) * 100)}%)
        </span>
      )}
    </div>

    {/* Activities in visible areas */}
    {visibleAreaActivityCount > 0 && (
      <div style={{ fontSize: 11, color: "#6b7280" }}>
        Activities in view:{" "}
        <strong style={{ color: "#374151" }}>{visibleAreaActivityCount}</strong>
      </div>
    )}
  </div>
)}
```

**Step 3: Run dev server and verify sidebar shows the new summary card**

```bash
npm run dev
```

Navigate to Map tab. Sidebar should show "Community snapshot" section with age group chips, home visit coverage, and activity count.

---

### Task 6: Add census status indicator to sidebar and final cleanup

**Files:**
- Modify: `src/components/map/MapView.tsx` (sidebar, after the geocoding progress indicator)

**Step 1: Add census loading indicator in the sidebar after the existing geocoding progress block (~line 539)**

Find `{/* Refresh button */}` and insert before it:

```tsx
{/* Census loading progress */}
{censusStatus === "loading" && geocodingStatus === "done" && (
  <div
    style={{
      background: "#f5f3ff",
      border: "1px solid #ddd6fe",
      borderRadius: 7,
      padding: "8px 10px",
      color: "#5b21b6",
      fontSize: 12,
    }}
  >
    Loading neighborhood demographics…
  </div>
)}
```

**Step 2: Run full verification**

```bash
npm run dev
```

Checklist:
- [ ] Sidebar shows "Community snapshot" card with age groups, home visit coverage, and activity count
- [ ] People pin popup shows names, age group breakdown, activities in area, and census section
- [ ] Census section shows "Loading…" briefly then populates with population, income, race bars
- [ ] Clicking a pin for an area with no census result shows "No census data available"
- [ ] Refreshing geocoding clears census cache and re-fetches everything
- [ ] Reloading page loads census data instantly from localStorage cache

**Step 3: Commit**

```bash
git add src/components/map/MapView.tsx docs/plans/2026-02-22-map-demographics-design.md docs/plans/2026-02-22-map-demographics.md
git commit -m "feat: add census demographics and community stats to map view"
```

---

## Notes for implementer

- The Census Geocoder `vintage=Census2020_Census2020` uses 2020 boundaries; the ACS data year is 2023 (latest available 5-year estimates). This mismatch is fine — tracts rarely change boundaries.
- The Census APIs return `-666666666` for suppressed/unavailable values. The `fetchACSData` function handles this by returning `null` for income.
- `peoplePins` is already `useMemo`-derived, so the census effect dependency on `peoplePins.length` is safe.
- If an area fails both Census Geocoder and ACS, `null` is stored in the cache — the popup shows "No census data available" rather than perpetually retrying.
