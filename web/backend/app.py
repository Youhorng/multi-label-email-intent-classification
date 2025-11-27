# app.py
import os
import json
from typing import List

import torch
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from peft import PeftModel

# ---------- Paths ----------
FINAL_DIR = "/Users/youhorng/Desktop/projects/multi-label-email-intent-classification/model/final_model"
META_PATH = "/Users/youhorng/Desktop/projects/multi-label-email-intent-classification/notebooks/preprocess_meta.json"

# ---------- Load meta ----------
with open(META_PATH, "r") as f:
    meta = json.load(f)

BASE_MODEL_NAME = meta["model_name"]          # "distilbert-base-uncased"
MAX_LENGTH = meta.get("max_length", 256)
label2id = {k: int(v) for k, v in meta["label2id"].items()}
id2label = {int(k): v for k, v in meta["id2label"].items()}
num_labels = len(label2id)

# ---------- Device ----------
device = torch.device(
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)

# ---------- Load model once at startup ----------
tokenizer = AutoTokenizer.from_pretrained(FINAL_DIR)

base_model = AutoModelForSequenceClassification.from_pretrained(
    BASE_MODEL_NAME,
    num_labels=num_labels,
    problem_type="multi_label_classification",
    id2label=id2label,
    label2id=label2id,
)

model = PeftModel.from_pretrained(base_model, FINAL_DIR)
model.to(device)
model.eval()

# ---------- FastAPI app ----------
app = FastAPI(title="Email Intent Classifier API")


class PredictRequest(BaseModel):
    text: str
    threshold: float = 0.55


class LabelScore(BaseModel):
    label: str
    score: float


class PredictResponse(BaseModel):
    predictions: List[LabelScore]


def infer(text: str, threshold: float = 0.55):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=MAX_LENGTH,
        padding=False,
    ).to(device)

    with torch.no_grad():
        logits = model(**inputs).logits.squeeze()
        probs = torch.sigmoid(logits).cpu().numpy()

    results = [
        {"label": id2label[i], "score": float(p)}
        for i, p in enumerate(probs)
        if p >= threshold
    ]
    # if nothing passes threshold, still return top
    if not results:
        top_idx = int(np.argmax(probs))
        results = [{"label": id2label[top_idx], "score": float(probs[top_idx])}]

    # sort high → low
    results.sort(key=lambda x: x["score"], reverse=True)
    return results


@app.get("/")
def root():
    """Root endpoint with API information"""
    return {
        "name": "Email Intent Classifier API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict (POST)",
            "predict_get": "/predict?text=...&threshold=0.55 (GET)",
            "health": "/health (GET)",
            "status": "/status (GET)",
            "docs": "/docs",
            "openapi": "/openapi.json"
        }
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """Predict email intents using POST request with JSON body"""
    preds = infer(req.text, threshold=req.threshold)
    return PredictResponse(predictions=[LabelScore(**p) for p in preds])


@app.get("/predict")
def predict_get(text: str, threshold: float = 0.55):
    """Predict email intents using GET request with query parameters"""
    preds = infer(text, threshold=threshold)
    return {"predictions": [LabelScore(**p) for p in preds]}


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok"}


@app.get("/status")
def status():
    """Status endpoint (alias for /health)"""
    return {"status": "ok", "model_loaded": True, "device": str(device)}
