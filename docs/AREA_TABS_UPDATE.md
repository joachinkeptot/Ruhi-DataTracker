# Area Tabs Feature Update

## Overview

The canvas has been restructured to use **Area-based tabs**. Now when you create a new Person with an Area, a new tab is automatically created for that Area, and each tab has its own canvas view.

## Changes Made

### HTML Changes (index.html)

- Replaced the fixed "People/Activities" tabs with dynamic area tabs
- Changed tab structure:
  - **Before**: `<button class="tab" data-tab="people">People</button>`
  - **After**: `<button class="tab" data-area="all">All Areas</button>` (dynamically generated)

### JavaScript Changes (app.js)

#### New State Property

- Added `selectedArea: "all"` to track which area tab is currently active

#### New Functions

1. **`getAreaList()`** - Returns a sorted list of all unique areas from people
2. **`updateAreaTabs()`** - Automatically creates/removes area tabs based on current data
3. **`switchArea(area)`** - Switches to the selected area tab and updates the canvas

#### Modified Functions

- **`renderCanvas()`** - Now filters items by `selectedArea` before rendering
  - Displays only people from the selected area
  - Shows "All Areas" view when area tab is "all"
- **`deletePerson()`** - Now calls `updateAreaTabs()` to remove empty area tabs
- **Form submission** - Calls `updateAreaTabs()` after creating new people
- **Import functions** - Call `updateAreaTabs()` after importing data
- **Auto-sync** - Calls `updateAreaTabs()` when syncing remote data

#### Removed Code

- Removed the old "People/Activities" tab button event listeners

## How It Works

1. **Adding a Person with an Area**:
   - When you create a person and assign them to an area (e.g., "Downtown")
   - A new tab labeled "Downtown" is automatically created
   - Click that tab to view only people from that area

2. **Canvas per Area**:
   - Each area tab shows only the people assigned to that area
   - The canvas displays area-specific relationships and connections
   - "All Areas" tab shows everyone (unfiltered)

3. **Automatic Cleanup**:
   - When you delete the last person from an area, that area's tab is removed

4. **Area Names**:
   - Areas are sorted alphabetically
   - Area names are case-insensitive for grouping purposes

## Example Workflow

1. Create Person 1: "John" → Area: "Downtown"
2. Create Person 2: "Jane" → Area: "Downtown"
3. Create Person 3: "Bob" → Area: "Uptown"
4. The app now shows tabs: `All Areas | Downtown | Uptown`
5. Click "Downtown" to see only John and Jane's connections
6. Click "Uptown" to see only Bob
7. Click "All Areas" to see everyone

## Technical Notes

- Area filtering uses case-insensitive matching
- Empty areas (with no people) don't get tabs
- The "All Areas" tab is always available
- Tab state persists through save/load cycles
