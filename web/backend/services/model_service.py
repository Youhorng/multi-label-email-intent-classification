# Service for model loading and inference
import torch
import numpy as np
from typing import List, Dict, Tuple, Optional
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from peft import PeftModel

try:
    from ..config import (
        FINAL_DIR,
        BASE_MODEL_NAME,
        MAX_LENGTH,
        label2id,
        id2label,
        num_labels,
        USE_HF_HUB,
        HF_MODEL_ID,
    )
except ImportError:
    from web.backend.config import (
        FINAL_DIR,
        BASE_MODEL_NAME,
        MAX_LENGTH,
        label2id,
        id2label,
        num_labels,
        USE_HF_HUB,
        HF_MODEL_ID,
    )

# Model service for managing model and performing inference
class ModelService:
    
    def __init__(self):
        # Initialize the model service and load the model
        self.device = self._get_device()
        self.tokenizer = None
        self.model = None
        self._load_model()
    
    def _get_device(self) -> torch.device:
        # Determine the best available device
        if torch.cuda.is_available():
            return torch.device("cuda")
        elif torch.backends.mps.is_available():
            return torch.device("mps")
        else:
            return torch.device("cpu")
    
    def _load_model(self):
        """Load model from either Hugging Face Hub or local directory"""
        if USE_HF_HUB:
            print(f"Loading from Hugging Face Hub: {HF_MODEL_ID}")
            # Load tokenizer from HF Hub
            self.tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_ID)
            
            # Load base model
            base_model = AutoModelForSequenceClassification.from_pretrained(
                BASE_MODEL_NAME,
                num_labels=num_labels,
                problem_type="multi_label_classification",
                id2label=id2label,
                label2id=label2id,
            )
            
            # Load PEFT adapter from HF Hub
            self.model = PeftModel.from_pretrained(base_model, HF_MODEL_ID)
        else:
            print(f"Loading from local directory: {FINAL_DIR}")
            # Load tokenizer from local directory
            self.tokenizer = AutoTokenizer.from_pretrained(str(FINAL_DIR))
            
            # Load base model
            base_model = AutoModelForSequenceClassification.from_pretrained(
                BASE_MODEL_NAME,
                num_labels=num_labels,
                problem_type="multi_label_classification",
                id2label=id2label,
                label2id=label2id,
            )
            
            # Load PEFT adapter from local directory
            self.model = PeftModel.from_pretrained(base_model, str(FINAL_DIR))
        
        self.model.to(self.device)
        self.model.eval()
        print("✅ Model loaded successfully!")
    
    def predict(self, text: str, threshold: float = 0.55, return_all: bool = False) -> Tuple[List[Dict[str, float]], Optional[List[Dict[str, float]]]]:

        # Tokenize input
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=MAX_LENGTH,
            padding=False,
        ).to(self.device)
        
        # Perform inference
        with torch.no_grad():
            logits = self.model(**inputs).logits.squeeze()
            probs = torch.sigmoid(logits).cpu().numpy()
        
        # Get all probabilities sorted by score
        all_results = [
            {"label": id2label[i], "score": float(p)}
            for i, p in enumerate(probs)
        ]
        all_results.sort(key=lambda x: x["score"], reverse=True)
        
        # Filter by threshold
        filtered_results = [
            {"label": id2label[i], "score": float(p)}
            for i, p in enumerate(probs)
            if p >= threshold
        ]
        
        # If nothing passes threshold, return top prediction
        if not filtered_results:
            top_idx = int(np.argmax(probs))
            filtered_results = [{"label": id2label[top_idx], "score": float(probs[top_idx])}]
        
        # Sort by score descending
        filtered_results.sort(key=lambda x: x["score"], reverse=True)
        
        return filtered_results, all_results if return_all else None
    
    def get_device_info(self) -> str:
        # Get the device information
        return str(self.device)
    
    def get_model_source(self) -> str:
        # Get the model source (HF Hub or local)
        return "Hugging Face Hub" if USE_HF_HUB else "Local"
    
    def is_loaded(self) -> bool:
        # Check if model is loaded
        return self.model is not None and self.tokenizer is not None


# Global instance (singleton pattern) - ensures only one instance of the model service is created
_model_service: ModelService = None


def get_model_service() -> ModelService:
    # Get or create the global model service instance
    global _model_service
    if _model_service is None:
        _model_service = ModelService()
    return _model_service

