# ATML Lab 6 — Encoder-Decoder Architecture

**Course:** Advanced Topics in Machine Learning  
**Program:** B.Tech AI — Semester VI  
**Institute:** SVKM's NMIMS, Mukesh Patel School of Technology Management & Engineering  


---

## Overview

End-to-end implementation of Encoder-Decoder Architecture for Machine Translation using PyTorch from scratch, with a live React + Flask frontend for real-time translation demo.

---

## Phases

| Phase | Task | Epochs | Status |
|-------|------|--------|--------|
| 1 | English → Hindi Translation (LSTM Seq2Seq) | 300 | ✅ Complete |
| 2 | Performance Analysis and Evaluation | — | ✅ Complete |
| 3 | English → Spanish Translation (Bahdanau Attention) | 150 | ✅ Complete |

---

## Architecture

### Phase 1 — English → Hindi
- **Encoder:** Embedding Layer → 2-layer Bidirectional LSTM (hidden=512)
- **Context Vector:** Concatenated final forward and backward hidden states
- **Decoder:** Embedding Layer → 2-layer LSTM (hidden=512) → Linear → Softmax
- **Dataset:** Hindi-English Parallel Corpus
- **Optimizer:** Adam (lr=0.001) | Batch: 64 | Teacher Forcing: 0.5

### Phase 3 — English → Spanish
- **Encoder:** Embedding Layer → 3-layer LSTM (hidden=256, dropout=0.3)
- **Attention:** Bahdanau (Additive) Attention Mechanism
- **Decoder:** Embedding Layer → 3-layer LSTM with Attention (hidden=256)
- **Dataset:** HuggingFace opus_books en-es (10K pairs)
- **Optimizer:** Adam (lr=0.0005) | Batch: 128 | Teacher Forcing: 0.9→0.1 decay

---

## Project Structure

```
I039_LAB6_ATML/
├── backend/
│   └── app.py                    # Flask translation API (port 5001)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── TranslateDemo.jsx # Live translation demo
│       │   ├── LossChart.jsx     # Train vs Val loss chart
│       │   ├── BleuChart.jsx     # BLEU score chart
│       │   ├── MetricCard.jsx    # Stat cards
│       │   └── Sidebar.jsx       # Navigation
│       ├── pages/
│       │   ├── Dashboard.jsx     # All phases overview
│       │   ├── Phase1.jsx        # Eng→Hindi page
│       │   ├── Phase2.jsx        # Analysis page
│       │   └── Phase3.jsx        # Eng→Spanish page
│       └── data/                 # Training history JSON files
├── lab6_encoder_decoder/
│   ├── models/
│   │   ├── encoder.py            # LSTM Encoder
│   │   ├── decoder.py            # LSTM Decoder with Attention
│   │   └── seq2seq.py            # Seq2Seq wrapper
│   ├── utils/
│   │   ├── dataset.py            # Data loaders
│   │   ├── vocab.py              # Vocabulary builder
│   │   ├── metrics.py            # BLEU / ROUGE helpers
│   │   └── attention.py          # Bahdanau attention module
│   ├── phase1_eng_hindi.py       # Phase 1 training script
│   ├── phase2_analysis.py        # Phase 2 evaluation script
│   ├── phase3_eng_spanish.py     # Phase 3 training script
│   └── run_all.py                # Runs all phases
├── extract_results.py            # Extracts results from checkpoints
├── start.sh                      # One command to start everything
└── requirements.txt
```

---

## Setup and Running

### 1. Install dependencies
```bash
pip3 install -r requirements.txt
cd frontend && npm install
```

### 2. Start everything with one command
```bash
bash start.sh
```

This will:
- Extract results from saved checkpoints
- Start Flask backend on port 5001
- Start React frontend on port 5173

### 3. Open in browser
```
http://localhost:5173
```

---

## Frontend Features

- **Dashboard** — Overview of all phases with combined loss chart
- **Phase 1 Page** — Loss curve, BLEU chart, live English→Hindi translation demo
- **Phase 2 Page** — Performance analysis and evaluation metrics
- **Phase 3 Page** — Loss curve, BLEU chart, live English→Spanish translation demo
- **Live Translation** — Type any English sentence and get real-time output from the trained model

---

## Results

| Phase | Train Loss | Val Loss | BLEU |
|-------|-----------|----------|------|
| 1 — Eng→Hindi | See charts | See charts | See dashboard |
| 3 — Eng→Spanish | See charts | See charts | See dashboard |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Framework | PyTorch |
| Frontend | React 18 + Vite + TailwindCSS |
| Charts | Recharts |
| Backend API | Flask + Flask-CORS |
| Dataset (P1) | Hindi-English Parallel Corpus |
| Dataset (P3) | HuggingFace opus_books en-es |

---

## References

- Sutskever et al. (2014) — Sequence to Sequence Learning with Neural Networks
- Bahdanau et al. (2015) — Neural Machine Translation by Jointly Learning to Align and Translate
- https://www.kaggle.com/code/uselessnoob/english-to-hindi-machine-translation
- HuggingFace opus_books dataset
