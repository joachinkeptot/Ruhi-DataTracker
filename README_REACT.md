# RoomMap Ops - React TypeScript Version

## Overview

This is the React + TypeScript conversion of RoomMap Ops, a visual community tracking and management system for Bahá'í community activities.

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Context API** for state management
- **localStorage** for data persistence
- **Strict TypeScript** configuration

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── types.ts           # TypeScript type definitions
├── utils.ts           # Utility functions (ID generation, localStorage)
├── AppContext.tsx     # React Context for global state management
├── App.tsx            # Main application component
├── Header.tsx         # Header with tabs and search
├── FilterBar.tsx      # Filter controls
├── Canvas.tsx         # Visual canvas with drag & drop
├── DetailPanel.tsx    # Person/Activity detail view
├── Statistics.tsx     # Statistics breakdowns
├── Tools.tsx          # Import/Export tools
├── ItemModal.tsx      # Add/Edit modal form
├── main.tsx           # React entry point
└── styles.css         # CSS styles
```

## Key Features

### Strict TypeScript Typing

- All components use proper TypeScript types
- No `any` types - full type safety
- Strict compiler options enabled

### State Management

- React Context API for global state
- Custom hooks for accessing state
- Automatic localStorage persistence

### Data Model

- **Person**: Enhanced with family links, demographics, tracking
- **Family**: New entity for family groups
- **Activity**: Community programs (JY, CC, Study Circles, Devotionals)
- **HomeVisit, Conversation, PersonConnection**: Relationship tracking

### Three View Modes

1. **Areas** - Geographic grouping
2. **Cohorts** - Categories or Families view
3. **Activities** - Program tracking

### Features

- Drag & drop canvas
- Real-time search and filtering
- CSV & JSON import/export
- Family management
- Detailed person tracking
- Activity connections

## Migration from Vanilla JS

All your existing data in localStorage is automatically migrated to the new structure. The app:

- Reads from the same `roommap_ops_single_v2` key
- Applies default values to new fields
- Preserves all existing data
- No data loss during migration

## Development Notes

### Adding New Features

1. Update types in `src/types.ts`
2. Add state management in `AppContext.tsx`
3. Create/update components as needed
4. TypeScript will catch any type errors

### Custom Hooks

Use `useApp()` hook to access global state:

```typescript
import { useApp } from "./AppContext";

const MyComponent = () => {
  const { people, addPerson, deletePerson } = useApp();
  // ...
};
```

## Legacy Files

The original vanilla JavaScript version files are still present:

- `index.html` - Original HTML entry
- `app.js` - Original JavaScript logic
- `server.py` - Python backend (optional)

You can keep these for reference or remove them.

## Type Safety

All data structures are strictly typed. See `src/types.ts` for complete type definitions including:

- Connection types
- Age groups
- Employment/Participation statuses
- Entity interfaces (Person, Family, Activity)
- Application state types

## Future Enhancements

Potential additions:

- UI for managing home visits and conversations
- UI for person-to-person connections
- Visual connection lines on canvas
- Advanced filtering by family, age group, etc.
- Family detail modal
- Export to additional formats
