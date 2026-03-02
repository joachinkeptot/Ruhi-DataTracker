#!/usr/bin/env python3
"""
RoomMap Ops Backend - Shared Data Server
Allows multiple users to access and modify the same tracker data in real-time.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Data storage file
DATA_FILE = Path(__file__).parent / "roommap_data.json"

def load_data():
    """Load data from file or return empty state."""
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return get_empty_state()
    return get_empty_state()

def get_empty_state():
    """Return empty initial state."""
    return {
        "people": [],
        "activities": [],
        "selected": {"type": "people", "id": None},
        "groupPositions": {},
        "lastUpdated": datetime.now().isoformat()
    }

def save_data(data):
    """Save data to file."""
    data["lastUpdated"] = datetime.now().isoformat()
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except IOError as e:
        print(f"Error saving data: {e}")
        return False

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "server": "RoomMap Ops v1"}), 200

@app.route('/api/data', methods=['GET'])
def get_data():
    """Get all tracker data."""
    data = load_data()
    return jsonify(data), 200

@app.route('/api/data', methods=['POST'])
def save_state():
    """Save tracker data from client."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate structure
        if "people" not in data or "activities" not in data:
            return jsonify({"error": "Invalid data structure"}), 400
        
        if save_data(data):
            return jsonify({"status": "saved", "timestamp": datetime.now().isoformat()}), 200
        else:
            return jsonify({"error": "Failed to save"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/export', methods=['GET'])
def export_data():
    """Export data as JSON download."""
    data = load_data()
    return jsonify(data), 200, {
        'Content-Disposition': 'attachment; filename=roommap_export.json'
    }

@app.route('/api/clear', methods=['POST'])
def clear_data():
    """Clear all data (requires confirmation header)."""
    if request.headers.get('X-Confirm-Clear') != 'yes':
        return jsonify({"error": "Confirmation required"}), 400
    
    if save_data(get_empty_state()):
        return jsonify({"status": "cleared"}), 200
    else:
        return jsonify({"error": "Failed to clear"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print("\n" + "="*50)
    print("🚀 RoomMap Ops Backend Server")
    print("="*50)
    print(f"📁 Data file: {DATA_FILE}")
    print(f"🌐 API running on http://localhost:{port}")
    print("\nEndpoints:")
    print("  GET  /api/health  - Health check")
    print("  GET  /api/data    - Fetch all data")
    print("  POST /api/data    - Save all data")
    print("  GET  /api/export  - Export as JSON")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=port)
