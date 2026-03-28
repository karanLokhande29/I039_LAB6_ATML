#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "Step 1: Extracting results from checkpoints..."
PYTHONPATH=. python3 extract_results.py

echo "Step 2: Copying JSON data to frontend..."
mkdir -p frontend/src/data frontend/public
cp lab6_encoder_decoder/outputs/frontend_data_phase1.json frontend/src/data/
cp lab6_encoder_decoder/outputs/frontend_data_phase2.json frontend/src/data/
cp lab6_encoder_decoder/outputs/frontend_data_phase3.json frontend/src/data/
cp lab6_encoder_decoder/outputs/frontend_summary.json frontend/src/data/
if [[ -f lab6_encoder_decoder/outputs/phase2_loss_curve.png ]]; then
  cp lab6_encoder_decoder/outputs/phase2_loss_curve.png frontend/public/
else
  echo "Note: lab6_encoder_decoder/outputs/phase2_loss_curve.png not found — Dashboard image may be missing."
fi

echo "Step 3: Installing frontend dependencies..."
cd frontend && npm install

echo "Step 4: Starting frontend..."
npm run dev
