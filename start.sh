#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🏏 CricketIQ — Starting servers..."

# Kill old processes on 8000 and 3000
lsof -ti :8000 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
sleep 1

# Start backend
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/cricketiq-backend.log 2>&1 &
echo "Backend PID: $!"

# Wait for backend
for i in {1..15}; do
  python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" 2>/dev/null && break || sleep 1
done
echo "✅ Backend ready at http://localhost:8000"

# Start frontend
cd "$SCRIPT_DIR/frontend"
nohup npm run dev > /tmp/cricketiq-frontend.log 2>&1 &
echo "Frontend PID: $!"

# Wait for frontend
for i in {1..30}; do
  python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/')" 2>/dev/null && break || sleep 2
done
echo "✅ Frontend ready at http://localhost:3000"
echo ""
echo "🏏 CricketIQ is LIVE! Open http://localhost:3000"
