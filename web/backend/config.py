# Configuration settings for the Email Intent Classifier API
import json
import os
from pathlib import Path


# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent
FINAL_DIR = PROJECT_ROOT / "model" / "final_model"
META_PATH = PROJECT_ROOT / "notebooks" / "preprocess_meta.json"

# Load metadata
with open(META_PATH, "r") as f:
    meta = json.load(f)

BASE_MODEL_NAME = meta["model_name"]  # "distilbert-base-uncased"
MAX_LENGTH = meta.get("max_length", 256)
label2id = {k: int(v) for k, v in meta["label2id"].items()}
id2label = {int(k): v for k, v in meta["id2label"].items()}
num_labels = len(label2id)

# Model Loading Configuration
# Set to True to load from Hugging Face Hub, False to load from local directory
USE_HF_HUB = True  # Set to True to use Hugging Face Hub (might be slower)
HF_MODEL_ID = "Youhorng/distilbert-lora-multilabel-email-intent-classification"

# API Configuration 
API_TITLE = "Email Intent Classifier API"
API_VERSION = "1.0.0"
DEFAULT_THRESHOLD = 0.55

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    # Add your production frontend URL here
]