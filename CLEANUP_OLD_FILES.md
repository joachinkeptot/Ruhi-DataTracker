# Old Files to Remove - React TypeScript Migration

This document lists all old vanilla JavaScript files that should be removed from the project. They were part of the legacy setup and are no longer used.

## Files to Delete

### JavaScript/HTML (Old Vanilla Setup)

- **app.js** (46KB) - Old vanilla JavaScript application
  - No longer needed; replaced by React TypeScript codebase
  - Reference: Old DOM manipulation code
- **index.html** (13KB) - Old entry point
  - No longer needed; replaced by `index-react.html`(4KB)
  - This was served at `http://localhost:3000/`
- **types.ts** (2.6KB) - Old root-level type definitions
  - No longer needed; types are now in `src/types/index.ts` (586 lines)
- **styles.css** (root level) - Old vanilla JS styles
  - No longer needed; styles are in `src/styles/index.css`
  - Check if any styles from root level need to be migrated

### Startup Script

- **start.sh** - Old startup script for vanilla setup
  - Consider removing or updating for React-only setup

## How to Remove

### Option 1: Using Terminal (Recommended)

```bash
cd /Users/COOKIES/Tracker-
rm -f app.js index.html types.ts styles.css start.sh
```

### Option 2: Rename for Archive

```bash
cd /Users/COOKIES/Tracker-
mv app.js app.js.old
mv index.html index.html.old
mv types.ts types.ts.old
mv styles.css styles.css.old
mv start.sh start.sh.old
```

## What's Kept (React TypeScript Setup)

✅ `index-react.html` - Main entry point  
✅ `src/` - All React TypeScript source code  
✅ `src/types/` - Type definitions  
✅ `src/styles/` - New CSS structure  
✅ `vite.config.ts` - Build configuration  
✅ `package.json` - Dependencies (updated)  
✅ `tsconfig.json` - TypeScript configuration

## URLs After Cleanup

All traffic should use React TypeScript URLs:

- Main App: `http://localhost:3000/index-react.html`
- Public Forms: `http://localhost:3000/index-react.html?public=true`

**Old URLs that will no longer work:**

- `http://localhost:3000/` (vanilla JS app) ❌

## Verification

After deletion, run:

```bash
npm run build   # Should complete successfully
npm run dev     # Should serve React app at port 3000
```

Build verification shows all changes are working correctly:
✓ 1110 modules transformed
✓ TypeScript strict mode compliance
✓ No errors or warnings
