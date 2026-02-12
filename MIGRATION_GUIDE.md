# Migration Guide: Vanilla JS to React + TypeScript

## What Was Changed

### Architecture

**Before:** Vanilla JavaScript with global state and event listeners
**After:** React components with TypeScript, Context API for state, hooks for lifecycle

### Type Safety

**Before:** No type checking, potential runtime errors
**After:** Strict TypeScript with compile-time type checking

### State Management

**Before:** Global `state` object with manual DOM updates
**After:** React Context API with `useApp()` hook, automatic re-renders

### Components

The vanilla JS app has been converted into these React components:

| Vanilla JS     | React Component   | Purpose                   |
| -------------- | ----------------- | ------------------------- |
| Header section | `Header.tsx`      | Tabs, search, add button  |
| Filter bar     | `FilterBar.tsx`   | Filter controls           |
| Canvas         | `Canvas.tsx`      | Drag & drop visualization |
| Detail panel   | `DetailPanel.tsx` | Person/Activity details   |
| Stats          | `Statistics.tsx`  | Statistics breakdowns     |
| Modal          | `ItemModal.tsx`   | Add/Edit forms            |
| Tools          | `Tools.tsx`       | Import/Export             |
| Main           | `App.tsx`         | Main application          |

### Key Technical Changes

#### 1. State Management

```javascript
// Before (Vanilla JS)
const state = {
  people: [],
  activities: [],
  families: []
};

// After (React)
const AppContext = createContext<AppContextType>();
const { people, activities, families } = useApp();
```

#### 2. Event Handling

```javascript
// Before (Vanilla JS)
canvas.addEventListener("pointerdown", handlePointerDown);

// After (React)
<div onPointerDown={(e) => handlePointerDown(e, item)} />;
```

#### 3. DOM Updates

```javascript
// Before (Vanilla JS)
detailPanel.innerHTML = `<h4>${person.name}</h4>`;

// After (React)
return (
  <div>
    <h4>{person.name}</h4>
  </div>
);
```

#### 4. Data Persistence

```javascript
// Before (Vanilla JS)
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

// After (React)
useEffect(() => {
  saveToLocalStorage(state);
}, [people, activities, families]);
```

## File Structure Comparison

### Vanilla JS Version

```
├── index.html          # Main HTML
├── app.js              # All logic (~1400 lines)
├── styles.css          # Styles
├── types.ts            # Type definitions (documentation only)
└── server.py           # Optional backend
```

### React TypeScript Version

```
├── index-react.html    # React entry HTML
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite bundler config
└── src/
    ├── main.tsx        # React entry point
    ├── App.tsx         # Main component
    ├── AppContext.tsx  # State management
    ├── types.ts        # Type definitions
    ├── utils.ts        # Utilities
    ├── Header.tsx      # Header component
    ├── FilterBar.tsx   # Filters
    ├── Canvas.tsx      # Canvas
    ├── DetailPanel.tsx # Details
    ├── Statistics.tsx  # Stats
    ├── ItemModal.tsx   # Modal
    ├── Tools.tsx       # Tools
    └── styles.css      # Styles
```

## Data Compatibility

✅ **100% Compatible** - Your existing localStorage data works with the React version!

Both versions use the same storage key: `roommap_ops_single_v2`

The React version includes automatic migration:

- Reads existing data
- Applies default values to new fields
- No data loss
- Seamless transition

## Running Both Versions

You can run both versions side-by-side:

### Vanilla JS Version

```bash
# Start Python server
python3 server.py
# Visit: http://localhost:5000
```

### React Version

```bash
# Start Vite dev server
npm run dev
# Visit: http://localhost:3000/index-react.html
```

## Benefits of React + TypeScript

### 1. **Type Safety**

- Compile-time error detection
- Autocomplete in IDE
- Refactoring confidence

### 2. **Component Reusability**

- Modular architecture
- Easier to test
- Clear separation of concerns

### 3. **Better Developer Experience**

- Hot module replacement
- Fast refresh
- Better debugging

### 4. **Maintainability**

- Explicit data flow
- Type definitions as documentation
- Easier onboarding for new developers

### 5. **Scalability**

- Easy to add new features
- Component composition
- Testable architecture

## Features Preserved

All features from the vanilla JS version work in React:

✅ Three view modes (Areas, Cohorts, Activities)
✅ Canvas with drag & drop
✅ Search and filtering
✅ Family management
✅ Person/Activity CRUD
✅ Import/Export (CSV & JSON)
✅ Statistics breakdowns
✅ Cohort view toggle
✅ localStorage persistence
✅ All data fields (enhanced Person, Family, etc.)

## Migration Checklist

- [x] Project setup (package.json, tsconfig, vite)
- [x] Type definitions (strict TypeScript)
- [x] State management (React Context)
- [x] All components converted
- [x] Canvas with drag & drop
- [x] Forms and modals
- [x] Filters and search
- [x] Statistics
- [x] Import/Export
- [x] Family management
- [x] localStorage compatibility
- [x] Zero TypeScript errors
- [x] Development server running

## Next Steps

### Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript
```

### Deployment

```bash
npm run build
# Deploy the `dist/` folder
```

### Removing Old Files (Optional)

Once you're satisfied with the React version, you can remove:

- `index.html` (old)
- `app.js` (old)
- `types.ts` (root - now in src/)
- `server.py` (if not using backend)

Keep `styles.css` as it's shared.

## Support

For questions or issues:

1. Check `README_REACT.md` for usage
2. Review `src/types.ts` for data structures
3. See component files for implementation details
