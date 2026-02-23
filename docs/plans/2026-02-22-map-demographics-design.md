# Map Demographics & Statistics — Design

**Date:** 2026-02-22
**Status:** Approved

## Problem

The map view currently shows only raw person counts per area. Users want richer context: real-world neighborhood demographics (population, race breakdown, median income from US Census) alongside community-engagement stats derived from the app's own data (age groups, home visit coverage, activity presence).

## Intended Outcome

- **Popup (per area):** clicking a circle pin shows Census tract demographics + app stats for that area.
- **Sidebar (aggregate):** a new summary section shows aggregate app stats across all currently visible people.

---

## Architecture

### New Data: Census Demographics

**Flow:**
1. Area string → lat/lng (existing geo cache)
2. lat/lng → census tract FIPS via Census Geocoder API (free, no key)
3. tract FIPS → ACS 5-year demographics via Census ACS API (free, no key)
4. Cached in `localStorage` under key `roommap_census_cache` as `{ [area]: CensusData | null }`

**Census fields fetched (ACS 5-year, tract level):**
- `B01003_001E` — Total population
- `B02001_002E` — White alone
- `B02001_003E` — Black or African American alone
- `B02001_004E` — American Indian / Alaska Native alone
- `B02001_005E` — Asian alone
- `B02001_006E` — Native Hawaiian / Pacific Islander alone
- `B02001_007E` — Some other race alone
- `B02001_008E` — Two or more races
- `B19013_001E` — Median household income

**Census Geocoder URL:**
```
https://geocoding.geo.census.gov/geocoder/geographies/coordinates
  ?x={lng}&y={lat}
  &benchmark=Public_AR_Census2020
  &vintage=Census2020_Census2020
  &layers=10
  &format=json
```

**ACS URL:**
```
https://api.census.gov/data/2023/acs/acs5
  ?get=B01003_001E,B02001_002E,...
  &for=tract:{tract}
  &in=state:{state}+county:{county}
```

**Rate limiting:** Census Geocoder is lenient; run sequentially, no artificial delay needed (unlike Nominatim). ACS API similarly lenient.

### New Data: App-derived Stats

Computed from existing `people` and `activities` arrays already available via `useApp()` — no new data fetching.

---

## Components

### `MapView.tsx` — changes only

All changes are in the single file `src/components/map/MapView.tsx`.

**New state:**
```ts
const [censusCache, setCensusCache] = useState<CensusCache>(() => loadCensusCache());
const [censusStatus, setCensusStatus] = useState<"idle" | "loading" | "done">("idle");
```

**New type:**
```ts
interface CensusData {
  tractPop: number;
  races: { label: string; count: number }[]; // sorted descending
  medianIncome: number | null;
}
type CensusCache = { [area: string]: CensusData | null };
```

**New effect:** after geo cache populates lat/lng for an area, fetch census data for uncached areas (sequential, no throttle needed).

**Popup changes:** census section appears below the people list when `censusCache[area]` is non-null. Shows:
- "Tract population: X"
- Race breakdown as percentage bars (top 4 groups)
- "Median income: $X"

If census data is still loading, show a small "Loading demographics…" line.

App stats in popup:
- Age group breakdown (chips or counts)
- Activities in this area (count)

**Sidebar changes — new "Summary" section** (between the existing stats and the activity toggle):
- Age group distribution across all visible people (e.g., "JY: 4 · Youth: 7 · Adult: 12")
- Home visit coverage: "X of Y people have had a home visit (Z%)"
- Activities in visible areas: count

---

## File Modified

- `src/components/map/MapView.tsx` — only file changed

---

## Verification

1. `npm run dev`, navigate to Map tab
2. Wait for geocoding to complete
3. Verify sidebar shows new summary section with age breakdown and home visit coverage
4. Click a people pin → popup should show census data (may show "Loading…" briefly)
5. After census loads, verify race %, population, income appear
6. Reload — verify census data loads instantly from cache
7. Click Refresh geocoding → census cache should also clear and re-fetch
