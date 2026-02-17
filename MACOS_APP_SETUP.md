# 🎯 RoomMap Ops - macOS App Setup

Your app has been built as a native macOS application! Here's how to use it:

## Installation

### Option 1: DMG Installer (Recommended)

1. Go to `/dist` folder in your project
2. Find `RoomMap Ops-2.0.0-arm64.dmg`
3. Double-click to open the installer
4. Drag "RoomMap Ops" app to the Applications folder
5. Open Applications folder and double-click "RoomMap Ops" to launch

### Option 2: ZIP File

1. Go to `/dist` folder
2. Find `RoomMap Ops-2.0.0-arm64-mac.zip`
3. Double-click to extract
4. Move the extracted "RoomMap Ops" app to your Applications folder
5. Double-click to launch

## Launch the App

After installation, you can:

- **Finder**: Go to Applications → RoomMap Ops → Double-click
- **Spotlight**: Press `⌘ + Space`, type "RoomMap Ops", press Enter
- **Dock**: Drag the app to your Dock for quick access

## Data & Persistence

Your data is automatically saved to your Mac's local storage using localStorage. All your:

- ✅ People data
- ✅ Activities & reflections
- ✅ Cohorts & categories
- ✅ Connections

...will persist between app launches.

## Development

### Run Dev Mode with Electron

```bash
npm run dev:electron
```

This starts both the Vite dev server and Electron app with hot reload.

### Build New Version

```bash
npm run build:mac
```

This creates fresh DMG and ZIP files in `/dist`.

## Troubleshooting

**"Cannot open RoomMap Ops" on first launch:**

- Right-click the app → Open (this bypasses initial security warning)
- Or go to System Preferences → Security & Privacy → Allow

**App won't start:**

- Make sure you're using an Apple Silicon Mac (M1/M2/M3) or Intel Mac
- Delete and reinstall from the DMG

**Data not persisting:**

- The app stores data in the browser's localStorage
- This persists automatically between sessions
- To clear data: Developer Tools → Application → Storage → Clear All

## Future Updates

When you make changes to the app:

1. Run `npm run build:mac`
2. New `.dmg` and `.zip` files will be created in `/dist`
3. Share these files with others or keep for your records

Enjoy your standalone macOS app! 🎉
