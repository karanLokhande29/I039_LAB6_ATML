"""Flask API for live English→Hindi and English→Spanish translation (no training)."""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from flask import Flask, jsonify, request
from flask_cors import CORS

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from lab6_encoder_decoder.models.decoder import AttentiveLSTMDecoder, LSTMDecoder
from lab6_encoder_decoder.models.encoder import LSTMEncoder
from lab6_encoder_decoder.models.seq2seq import Seq2Seq
from lab6_encoder_decoder.phase3_eng_spanish import Seq2SeqAttention, translate_with_attention
from lab6_encoder_decoder.utils.dataset import simple_tokenize
from lab6_encoder_decoder.utils.vocab import Vocabulary

LAB_ROOT = PROJECT_ROOT / "lab6_encoder_decoder"
SAVED = LAB_ROOT / "saved_models"

PHASE1_PATH = SAVED / "phase1_eng_hindi_model.pt"
PHASE3_CKPT = SAVED / "phase3_checkpoint_epoch150.pt"
PHASE3_FALLBACK = SAVED / "phase3_eng_spanish_model.pt"

PHASE1_MAX_LEN = 30
P3_MAX_LEN = 30

app = Flask(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

phase1_model: Seq2Seq | None = None
phase1_src_vocab: Vocabulary | None = None
phase1_tgt_vocab: Vocabulary | None = None
phase1_ok = False

phase3_model: Seq2SeqAttention | None = None
phase3_src_vocab: Vocabulary | None = None
phase3_tgt_vocab: Vocabulary | None = None
phase3_ok = False


def _load_ckpt(path: Path):
    try:
        return torch.load(path, map_location=device, weights_only=False)
    except TypeError:
        return torch.load(path, map_location=device)


def vocab_from_mapping(mapping: dict) -> Vocabulary:
    v = Vocabulary()
    v.token_to_id = dict(mapping)
    v.id_to_token = {int(i): t for t, i in mapping.items()}
    return v


def bridge_bidirectional_states(hidden: torch.Tensor, cell: torch.Tensor):
    layers_times_dirs, batch, h = hidden.shape
    layers = layers_times_dirs // 2
    hidden = hidden.view(layers, 2, batch, h)
    cell = cell.view(layers, 2, batch, h)
    hidden = torch.cat([hidden[:, 0], hidden[:, 1]], dim=-1)
    cell = torch.cat([cell[:, 0], cell[:, 1]], dim=-1)
    return hidden, cell


@torch.no_grad()
def greedy_decode_phase1(model: Seq2Seq, src: torch.Tensor, sos_idx: int, eos_idx: int, max_len: int = PHASE1_MAX_LEN):
    model.eval()
    _, (hidden, cell) = model.encoder(src)
    hidden, cell = bridge_bidirectional_states(hidden, cell)
    bsz = src.size(0)
    tokens = torch.full((bsz,), sos_idx, device=src.device, dtype=torch.long)
    finished = torch.zeros(bsz, dtype=torch.bool, device=src.device)
    out_ids = [[] for _ in range(bsz)]
    for _ in range(max_len):
        logits, hidden, cell = model.decoder(tokens, hidden, cell)
        tokens = logits.argmax(dim=1)
        for i, tok in enumerate(tokens.tolist()):
            if not finished[i]:
                out_ids[i].append(tok)
                if tok == eos_idx:
                    finished[i] = True
    return out_ids


def build_phase1_model(src_vocab_size: int, tgt_vocab_size: int, src_pad: int, tgt_pad: int) -> Seq2Seq:
    encoder = LSTMEncoder(
        vocab_size=src_vocab_size,
        emb_dim=256,
        hidden_size=512,
        num_layers=2,
        pad_idx=src_pad,
        bidirectional=True,
        dropout=0.2,
    )
    decoder = LSTMDecoder(
        vocab_size=tgt_vocab_size,
        emb_dim=256,
        hidden_size=1024,
        num_layers=2,
        pad_idx=tgt_pad,
        dropout=0.2,
    )
    return Seq2Seq(encoder, decoder, pad_idx=src_pad)


def build_phase3_model(src_vocab_size: int, tgt_vocab_size: int, src_pad: int, tgt_pad: int) -> Seq2SeqAttention:
    encoder = LSTMEncoder(src_vocab_size, 256, 256, 3, src_pad, bidirectional=False, dropout=0.3)
    decoder = AttentiveLSTMDecoder(tgt_vocab_size, 256, 256, 256, 3, tgt_pad, dropout=0.3)
    return Seq2SeqAttention(encoder, decoder, src_pad)


def load_phase1() -> None:
    global phase1_model, phase1_src_vocab, phase1_tgt_vocab, phase1_ok
    try:
        if not PHASE1_PATH.exists():
            phase1_ok = False
            return
        ckpt = _load_ckpt(PHASE1_PATH)
        phase1_src_vocab = vocab_from_mapping(ckpt["src_vocab"])
        phase1_tgt_vocab = vocab_from_mapping(ckpt["tgt_vocab"])
        m = build_phase1_model(
            len(phase1_src_vocab), len(phase1_tgt_vocab), phase1_src_vocab.pad_idx, phase1_tgt_vocab.pad_idx
        ).to(device)
        state = ckpt.get("model_state") or ckpt.get("model_state_dict")
        m.load_state_dict(state)
        m.eval()
        phase1_model = m
        phase1_ok = True
    except Exception as e:
        print(f"[backend] Phase 1 load failed: {e}")
        phase1_model = None
        phase1_src_vocab = None
        phase1_tgt_vocab = None
        phase1_ok = False


def load_phase3() -> None:
    global phase3_model, phase3_src_vocab, phase3_tgt_vocab
    try:
        import pickle
        ckpt = torch.load('lab6_encoder_decoder/saved_models/phase3_checkpoint_epoch150.pt',
                          map_location='cpu')
        with open('lab6_encoder_decoder/saved_models/phase3_vocab.pkl', 'rb') as f:
            vocab = pickle.load(f)
        phase3_src_vocab = vocab['src_vocab']
        phase3_tgt_vocab = vocab['tgt_vocab']
        phase3_model = build_phase3_model(28465, 33351,
            phase3_src_vocab.pad_idx, phase3_tgt_vocab.pad_idx)
        phase3_model.load_state_dict(ckpt['model_state'])
        phase3_model.eval()
        global phase3_ok
        phase3_ok = True
        print('[backend] Phase 3 loaded successfully!')
    except Exception as e:
        print(f'[backend] Phase 3 load error: {e}')


def health():
    return jsonify({"phase1_loaded": phase1_ok, "phase3_loaded": phase3_ok, "status": "ok"})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "phase1_loaded": phase1_model is not None,
        "phase3_loaded": phase3_model is not None,
        "status": "ok"
    })

@app.route("/translate/hindi", methods=["POST"])
def translate_hindi():
    if not phase1_ok or phase1_model is None:
        return jsonify({"translation": "Model not loaded", "status": "error"}), 200
    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or "").strip()
    if not text:
        return jsonify({"translation": "", "status": "ok"})
    try:
        src_ids = phase1_src_vocab.encode(simple_tokenize(text), PHASE1_MAX_LEN)
        src = torch.tensor([src_ids], dtype=torch.long, device=device)
        pred = greedy_decode_phase1(phase1_model, src, phase1_tgt_vocab.sos_idx, phase1_tgt_vocab.eos_idx)[0]
        out = " ".join(phase1_tgt_vocab.decode(pred))
        return jsonify({"translation": out, "status": "ok"})
    except Exception as e:
        print(f"[backend] translate_hindi error: {e}")
        return jsonify({"translation": "Model not loaded", "status": "error"}), 200


@app.route("/translate/spanish", methods=["POST"])
def translate_spanish():
    if not phase3_ok or phase3_model is None:
        return jsonify({"translation": "Model not loaded", "status": "error"}), 200
    payload = request.get_json(silent=True) or {}
    text = (payload.get("text") or "").strip()
    if not text:
        return jsonify({"translation": "", "status": "ok"})
    try:
        src_ids = phase3_src_vocab.encode(simple_tokenize(text.lower()), P3_MAX_LEN)
        pred_tokens, _ = translate_with_attention(
            phase3_model, src_ids, phase3_src_vocab, phase3_tgt_vocab, device
        )
        out = " ".join(pred_tokens)
        return jsonify({"translation": out, "status": "ok"})
    except Exception as e:
        print(f"[backend] translate_spanish error: {e}")
        return jsonify({"translation": "Model not loaded", "status": "error"}), 200


load_phase1()
load_phase3()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
