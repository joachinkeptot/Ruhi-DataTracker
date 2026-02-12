# Quick Start Guide - React TypeScript Version

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open in Browser

Navigate to: **http://localhost:3000/index-react.html**

---

## ✅ Features

All original features are preserved:

- **Three View Modes:** Areas, Cohorts (with Family toggle), Activities
- **Canvas Visualization:** Drag & drop nodes
- **Real-time Search:** Filter by name, area, category
- **Advanced Filters:** Area, category, Ruhi level, JY texts, activity type
- **Family Management:** Link people to families, add new families
- **Person Tracking:** 20+ fields including demographics, education, participation
- **Import/Export:** CSV and JSON support
- **Statistics:** Dynamic breakdowns by view mode
- **Data Persistence:** Automatic localStorage save/load

---

## 📁 Project Structure

```
src/
├── main.tsx           # Entry point
├── App.tsx            # Main component
├── AppContext.tsx     # State management
├── types.ts           # TypeScript types
├── utils.ts           # Utilities
├── Header.tsx         # Header component
├── FilterBar.tsx      # Filters
├── Canvas.tsx         # Canvas visualization
├── DetailPanel.tsx    # Details panel
├── Statistics.tsx     # Stats
├── ItemModal.tsx      # Add/Edit modal
├── Tools.tsx          # Import/Export
└── styles.css         # Styles
```

---

## 🔧 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript types
```

---

## 💾 Data Migration

Your existing data is **automatically migrated** from the vanilla JS version. No action needed!

Both versions use the same localStorage key, so you can switch between them seamlessly.

---

## 📚 Documentation

- **README_REACT.md** - Full documentation
- **MIGRATION_GUIDE.md** - Detailed migration info
- **REACT_CONVERSION_SUMMARY.md** - Technical overview
- **types.ts** - All data type definitions

---

## 🎨 Usage Examples

### Adding a Person

1. Click the **+** button
2. Fill in the form
3. Select family (optional)
4. Choose age group, employment, participation
5. Click **Add**

### Adding a Family

1. Switch to **Cohorts** tab
2. Click **View: Categories** to toggle to **View: Families**
3. Click **+ Family** in the statistics panel
4. Enter family details

### Filtering

1. Click **⏷ Filters** to expand filter bar
2. Select area, category, Ruhi level range, etc.
3. Results update in real-time

### Exporting Data

1. Scroll to **Tools** section
2. Click **Export People CSV** or **Export All JSON**

---

## 🔍 TypeScript

All code is **strictly typed** with zero `any` types. Check `src/types.ts` for complete type definitions.

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9
# Then restart
npm run dev
```

### Type Errors

```bash
# Check for type errors
npm run type-check
```

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🎯 Next Steps

1. **Explore the app** - Try all three view modes
2. **Add some data** - Create people, families, activities
3. **Test features** - Canvas drag & drop, filters, import/export
4. **Review code** - Check out the component structure
5. **Build** - Run `npm run build` when ready for production

---

## 📦 Production Build

```bash
# Build optimized production bundle
npm run build

# Preview the build
npm run preview

# Deploy the dist/ folder
```

---

## 🌟 Highlights

- ✅ **100% TypeScript** - Full type safety
- ✅ **React 18** - Modern React features
- ✅ **Context API** - Clean state management
- ✅ **Vite** - Lightning fast HMR
- ✅ **Data Compatibility** - Works with existing data
- ✅ **Zero Errors** - Clean TypeScript compilation

---

**Enjoy your modernized RoomMap Ops app! 🎉**
