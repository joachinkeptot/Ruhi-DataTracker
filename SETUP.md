# 🎯 RoomMap Ops - Shared Tracker

A futuristic, real-time collaborative tracker for managing people and activities with your team.

## Features

✨ **Real-time Sync** - Changes sync automatically between all connected users
🌐 **Shared Server** - All data stored centrally, no manual exports needed  
🎨 **Futuristic UI** - Dark theme with cyan accents and smooth animations
📍 **Spatial Grouping** - Organize people/activities by area with draggable bubbles
🔄 **Auto-Save** - Changes save to both local storage and backend
📊 **Import/Export** - CSV and JSON support

## Quick Start

### Option 1: One-Command Start (Recommended)

```bash
cd /Users/COOKIES/Tracker-
./start.sh
```

This launches:

- Backend server: `http://localhost:5000`
- Frontend server: `http://localhost:8000`

Then share `http://[your-ip]:8000` with your friends.

### Option 2: Manual Start

**Terminal 1 - Backend:**

```bash
cd /Users/COOKIES/Tracker-
source .venv/bin/activate
python3 server.py
```

**Terminal 2 - Frontend:**

```bash
cd /Users/COOKIES/Tracker-
python3 -m http.server 8000
```

Then open:

- Your browser: `http://cd /Users/COOKIES/Tracker-
source .venv/bin/activate
python3 server.pylocalhost:8000`
- Friend's browser: `http://[your-ip]:8000`

## Finding Your IP

```bash
ipconfig getifaddr en0  # macOS
ipconfig getall         # Windows
hostname -I             # Linux
```

## Using the App

### Adding Items

- Click the **"+"** button
- Choose "People" or "Activities"

**People:**

- Enter name, area, categories, and optional notes

**Activities:**

- Select type: **JY**, **CC**, **Study Circle**, or **Devotional**
- Enter name and corresponding leader:
  - JY → Animator
  - CC → Teacher
  - Study Circle → Tutor
  - Devotional → Leader
- Add optional notes

### Managing Data

- **Drag nodes** - Move individual items around
- **Drag bubbles** - Move entire area groups together (people only)
- **Click nodes** - View/edit details in the side panel
- **Tab switching** - Toggle between People and Activities views

### Exporting/Importing

- **Export CSV** - Download people as spreadsheet
- **Export JSON** - Download all data as JSON
- **Import** - Drag & drop or select CSV/JSON files

## Data Persistence

- **Local Storage** - Saves to browser (backup)
- **Backend Server** - Saves to `roommap_data.json` (shared)
- **Auto-Sync** - Fetches updates every 3 seconds

## Disabling Backend Sync

Edit `app.js` line 2:

```javascript
const USE_BACKEND = false; // Falls back to localStorage only
```

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Python Flask with CORS
- **Storage:** JSON file-based (no database required)

## Troubleshooting

**"Failed to load data"**

- Ensure backend is running on port 5000
- Check browser console (F12) for errors

**"Changes not syncing"**

- Wait 3 seconds for auto-sync
- Try manual refresh (Cmd+R)
- Restart both servers

**Port already in use**

- Backend: Change port in `server.py` (line 107)
- Frontend: Change port in start script

## File Structure

```
Tracker-/
├── index.html      # UI structure
├── app.js          # Frontend logic + API calls
├── styles.css      # Futuristic theming
├── server.py       # Python Flask backend
├── start.sh        # Launch script
└── roommap_data.json  # Shared data (auto-created)
```

---

**Built with ❤️ for collaborative tracking**

python3 -m http.server
8000
