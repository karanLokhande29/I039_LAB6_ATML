#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "========================================"
echo "ATML Lab 6 — Starting all services"
echo "========================================"

echo "[1/3] Extracting checkpoint data..."
PYTHONPATH=. python3 extract_results.py

echo "[2/3] Copying data to frontend..."
mkdir -p frontend/src/data frontend/public
cp lab6_encoder_decoder/outputs/frontend_data_phase1.json frontend/src/data/
cp lab6_encoder_decoder/outputs/frontend_data_phase2.json frontend/src/data/
cp lab6_encoder_decoder/outputs/frontend_data_phase3.json frontend/src/data/
cp lab6_encoder_decoder/outputs/frontend_summary.json frontend/src/data/
if [[ -f lab6_encoder_decoder/outputs/phase2_loss_curve.png ]]; then
  cp lab6_encoder_decoder/outputs/phase2_loss_curve.png frontend/public/
fi

echo "[3/3] Starting Flask backend on port 5000..."
PYTHONPATH=. python3 backend/app.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

echo "Starting React frontend on port 5173..."
cd frontend && npm run dev &

echo ""
echo "========================================"
echo "Open: http://localhost:5173"
echo "Ctrl+C to stop everything"
echo "========================================"
wait
