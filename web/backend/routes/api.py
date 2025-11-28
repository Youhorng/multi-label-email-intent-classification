# API routes for the Email Intent Classifier
from fastapi import APIRouter
from typing import List

try:
    from ..models import PredictRequest, PredictResponse, LabelScore
    from ..services.model_service import get_model_service
    from ..config import API_VERSION, DEFAULT_THRESHOLD
except ImportError:
    from web.backend.models import PredictRequest, PredictResponse, LabelScore
    from web.backend.services.model_service import get_model_service
    from web.backend.config import API_VERSION, DEFAULT_THRESHOLD

router = APIRouter()


# Root endpoint with API information
@router.get("/")
def root():
    return {
        "name": "Email Intent Classifier API",
        "version": API_VERSION,
        "endpoints": {
            "predict": "/predict (POST)",
            "predict_get": "/predict?text=...&threshold=0.55 (GET)",
            "health": "/health (GET)",
            "status": "/status (GET)",
            "docs": "/docs",
            "openapi": "/openapi.json"
        }
    }


# Predict email intents using POST request with JSON body
@router.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    model_service = get_model_service()
    preds, all_probs = model_service.predict(req.text, threshold=req.threshold, return_all=req.return_all)
    response_data = {
        "predictions": [LabelScore(**p) for p in preds]
    }
    if all_probs is not None:
        response_data["all_probabilities"] = [LabelScore(**p) for p in all_probs]
    return PredictResponse(**response_data)


# Predict email intents using GET request with query parameters
@router.get("/predict")
def predict_get(text: str, threshold: float = DEFAULT_THRESHOLD, return_all: bool = False):
    model_service = get_model_service()
    preds, all_probs = model_service.predict(text, threshold=threshold, return_all=return_all)
    response = {"predictions": [LabelScore(**p).dict() for p in preds]}
    if all_probs is not None:
        response["all_probabilities"] = [LabelScore(**p).dict() for p in all_probs]
    return response


# Health check endpoint
@router.get("/health")
def health():
    return {"status": "ok"}


# Status endpoint with model information
@router.get("/status")
def status():
    model_service = get_model_service()
    return {
        "status": "ok",
        "model_loaded": model_service.is_loaded(),
        "device": model_service.get_device_info(),
        "model_source": model_service.get_model_source()
    }

