#!/usr/bin/env python3
"""Extract training metrics from existing checkpoints/history into JSON for the React frontend.

No training, no model instantiation — only file I/O and torch.load for checkpoint dicts.
"""

from __future__ import annotations

import json
import warnings
from datetime import datetime, timezone
from pathlib import Path

import torch

PROJECT_ROOT = Path(__file__).resolve().parent
LAB_ROOT = PROJECT_ROOT / "lab6_encoder_decoder"
OUTPUTS = LAB_ROOT / "outputs"
SAVED_MODELS = LAB_ROOT / "saved_models"

PHASE1_HISTORY = OUTPUTS / "phase1_history.json"
PHASE3_CKPT = SAVED_MODELS / "phase3_checkpoint_epoch150.pt"
PHASE3_HISTORY_JSON = OUTPUTS / "phase3_history.json"

OUT_PHASE1 = OUTPUTS / "frontend_data_phase1.json"
OUT_PHASE2 = OUTPUTS / "frontend_data_phase2.json"
OUT_PHASE3 = OUTPUTS / "frontend_data_phase3.json"
OUT_SUMMARY = OUTPUTS / "frontend_summary.json"

PHASE1_TOTAL_EPOCHS = 300
PHASE3_TOTAL_EPOCHS = 150


def _kb(path: Path) -> float:
    if not path.exists():
        return 0.0
    return path.stat().st_size / 1024.0


def load_phase1() -> dict:
    if not PHASE1_HISTORY.exists():
        raise FileNotFoundError(f"Missing Phase 1 history: {PHASE1_HISTORY}")

    with open(PHASE1_HISTORY, encoding="utf-8") as f:
        hist = json.load(f)

    train = hist.get("train_loss") or []
    val = hist.get("val_loss") or []
    bleu = hist.get("bleu") or []
    if train and val and bleu:
        n = min(len(train), len(val), len(bleu))
        train, val, bleu = train[:n], val[:n], bleu[:n]

    epochs = list(range(1, len(train) + 1))
    if len(epochs) != PHASE1_TOTAL_EPOCHS:
        warnings.warn(
            f"Phase 1 history length is {len(epochs)}, expected {PHASE1_TOTAL_EPOCHS} — using actual length.",
            UserWarning,
            stacklevel=2,
        )

    checkpoints = sorted(SAVED_MODELS.glob("phase1_checkpoint_epoch*.pt"))
    checkpoint_names = [p.name for p in checkpoints]

    return {
        "epochs": epochs,
        "train_loss": train,
        "val_loss": val,
        "bleu": bleu,
        "final_train_loss": float(train[-1]) if train else None,
        "final_val_loss": float(val[-1]) if val else None,
        "final_bleu": float(bleu[-1]) if bleu else None,
        "total_epochs": PHASE1_TOTAL_EPOCHS,
        "checkpoints": checkpoint_names,
    }


def load_phase3() -> dict:
    extra: dict = {}
    if PHASE3_HISTORY_JSON.exists():
        with open(PHASE3_HISTORY_JSON, encoding="utf-8") as f:
            extra = json.load(f)

    if not PHASE3_CKPT.exists():
        warnings.warn(
            f"Phase 3 checkpoint not found: {PHASE3_CKPT}. Writing single-point placeholder data.",
            UserWarning,
            stacklevel=2,
        )
        print(
            "WARNING: phase3_checkpoint_epoch150.pt missing — "
            "frontend_data_phase3.json uses placeholder single-point series."
        )
        return {
            "epochs": [PHASE3_TOTAL_EPOCHS],
            "train_loss": [None],
            "val_loss": [None],
            "bleu": [None],
            "final_train_loss": None,
            "final_val_loss": None,
            "final_bleu": None,
            "total_epochs": PHASE3_TOTAL_EPOCHS,
            "checkpoint_used": "phase3_checkpoint_epoch150.pt",
            "checkpoint_missing": True,
            "raw_checkpoint_keys": [],
            "note": str(PHASE3_CKPT),
        }

    try:
        ckpt = torch.load(PHASE3_CKPT, map_location="cpu", weights_only=False)
    except TypeError:
        ckpt = torch.load(PHASE3_CKPT, map_location="cpu")
    raw_keys = list(ckpt.keys()) if isinstance(ckpt, dict) else []

    history = ckpt.get("history") if isinstance(ckpt, dict) else None
    train_loss = val_loss = bleu = None
    if isinstance(history, dict):
        train_loss = history.get("train_loss")
        val_loss = history.get("val_loss")
        bleu = history.get("bleu")

    final_tl = ckpt.get("train_loss") if isinstance(ckpt, dict) else None
    final_vl = ckpt.get("val_loss") if isinstance(ckpt, dict) else None
    final_bl = ckpt.get("bleu") if isinstance(ckpt, dict) else None

    if isinstance(train_loss, list) and train_loss:
        if final_tl is None:
            final_tl = float(train_loss[-1])
    if isinstance(val_loss, list) and val_loss:
        if final_vl is None:
            final_vl = float(val_loss[-1])
    if isinstance(bleu, list) and bleu:
        if final_bl is None:
            final_bl = float(bleu[-1])

    if isinstance(final_tl, (int, float)):
        final_tl = float(final_tl)
    if isinstance(final_vl, (int, float)):
        final_vl = float(final_vl)
    if isinstance(final_bl, (int, float)):
        final_bl = float(final_bl)

    if (
        isinstance(train_loss, list)
        and isinstance(val_loss, list)
        and isinstance(bleu, list)
        and train_loss
        and len(train_loss) == len(val_loss) == len(bleu)
    ):
        n = len(train_loss)
        epochs = list(range(1, n + 1))
        data = {
            "epochs": epochs,
            "train_loss": [float(x) for x in train_loss],
            "val_loss": [float(x) for x in val_loss],
            "bleu": [float(x) for x in bleu],
            "final_train_loss": float(train_loss[-1]),
            "final_val_loss": float(val_loss[-1]),
            "final_bleu": float(bleu[-1]),
            "total_epochs": PHASE3_TOTAL_EPOCHS,
            "checkpoint_used": "phase3_checkpoint_epoch150.pt",
            "raw_checkpoint_keys": raw_keys,
        }
    else:
        print(
            "WARNING: Phase 3 checkpoint has no full history arrays — "
            "using single-point series from scalar checkpoint fields."
        )
        tl = float(final_tl) if final_tl is not None else None
        vl = float(final_vl) if final_vl is not None else None
        bl = float(final_bl) if final_bl is not None else None
        data = {
            "epochs": [PHASE3_TOTAL_EPOCHS],
            "train_loss": [tl],
            "val_loss": [vl],
            "bleu": [bl],
            "final_train_loss": tl,
            "final_val_loss": vl,
            "final_bleu": bl,
            "total_epochs": PHASE3_TOTAL_EPOCHS,
            "checkpoint_used": "phase3_checkpoint_epoch150.pt",
            "raw_checkpoint_keys": raw_keys,
        }

    if extra:
        data["phase3_history_file"] = extra
    return data


def main() -> None:
    OUTPUTS.mkdir(parents=True, exist_ok=True)

    phase1 = load_phase1()
    with open(OUT_PHASE1, "w", encoding="utf-8") as f:
        json.dump(phase1, f, indent=2)

    phase2 = {
        "status": "complete",
        "plot": "phase2_loss_curve.png",
        "note": "See phase2_loss_curve.png in outputs folder",
    }
    with open(OUT_PHASE2, "w", encoding="utf-8") as f:
        json.dump(phase2, f, indent=2)

    phase3 = load_phase3()
    with open(OUT_PHASE3, "w", encoding="utf-8") as f:
        json.dump(phase3, f, indent=2)

    gen_time = datetime.now(timezone.utc).isoformat()
    summary = {
        "phases": [
            {
                "id": 1,
                "name": "Eng → Hindi Translation",
                "status": "complete",
                "epochs_done": PHASE1_TOTAL_EPOCHS,
                "total_epochs": PHASE1_TOTAL_EPOCHS,
                "final_bleu": phase1.get("final_bleu"),
                "final_train_loss": phase1.get("final_train_loss"),
                "final_val_loss": phase1.get("final_val_loss"),
            },
            {
                "id": 2,
                "name": "Performance Analysis",
                "status": "complete",
                "epochs_done": None,
                "total_epochs": None,
                "final_bleu": None,
                "final_train_loss": None,
                "final_val_loss": None,
            },
            {
                "id": 3,
                "name": "Eng → Spanish (Bahdanau Attention)",
                "status": "complete",
                "epochs_done": PHASE3_TOTAL_EPOCHS,
                "total_epochs": PHASE3_TOTAL_EPOCHS,
                "final_bleu": phase3.get("final_bleu"),
                "final_train_loss": phase3.get("final_train_loss"),
                "final_val_loss": phase3.get("final_val_loss"),
                "checkpoint": "phase3_checkpoint_epoch150.pt",
            },
        ],
        "generated_at": gen_time,
    }
    with open(OUT_SUMMARY, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    created = [OUT_PHASE1, OUT_PHASE2, OUT_PHASE3, OUT_SUMMARY]
    print("All frontend JSON files saved to outputs/")
    for p in created:
        try:
            rel = p.relative_to(LAB_ROOT)
        except ValueError:
            rel = p
        print(f"  {rel}  ({_kb(p):.2f} KB)")


if __name__ == "__main__":
    main()
