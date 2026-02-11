#!/bin/bash

# RoomMap Ops - Start Script
# Launches both backend server and frontend in separate terminals

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🚀 Starting RoomMap Ops with shared data..."
echo "================================================"

# Check if virtual environment exists
if [ -d "$PROJECT_DIR/.venv" ]; then
  source "$PROJECT_DIR/.venv/bin/activate"
  echo "✅ Virtual environment activated"
else
  echo "⚠️  No virtual environment found. Creating one..."
  python3 -m venv "$PROJECT_DIR/.venv"
  source "$PROJECT_DIR/.venv/bin/activate"
  pip install flask flask-cors > /dev/null 2>&1
fi

# Start backend server
echo "📡 Starting backend server on http://localhost:5000..."
cd "$PROJECT_DIR"
python3 server.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend server on http://localhost:8000..."
python3 -m http.server 8000 &
FRONTEND_PID=$!

sleep 1

echo "================================================"
echo "✨ RoomMap Ops is running!"
echo ""
echo "🖥️  Frontend:  http://localhost:8000"
echo "📡 Backend:   http://localhost:5000"
echo ""
echo "To connect with your friend:"
echo "  1. Find your IP: ipconfig getifaddr en0"
echo "  2. Share: http://[your-ip]:8000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================================"

# Handle cleanup
cleanup() {
  echo ""
  echo "Shutting down servers..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID 2>/dev/null
  wait $FRONTEND_PID 2>/dev/null
  echo "✅ Stopped"
  exit 0
}

trap cleanup INT TERM

# Wait for both processes
wait
