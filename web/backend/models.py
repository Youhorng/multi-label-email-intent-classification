# Pydantic models for request/response validation
from typing import List, Optional
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    # Request model for prediction endpoint
    text: str = Field(..., description="Email text to classify")
    threshold: float = Field(default=0.55, ge=0.0, le=1.0, description="Score threshold for predictions")
    return_all: bool = Field(default=False, description="If True, return all probabilities, not just those above threshold")


class LabelScore(BaseModel):
    # Model for a single label prediction with score
    label: str = Field(..., description="Predicted label")
    score: float = Field(..., description="Confidence score for the label")


class PredictResponse(BaseModel):
    # Response model for prediction endpoint
    predictions: List[LabelScore] = Field(..., description="List of predicted labels with scores (filtered by threshold if return_all=False)")
    all_probabilities: Optional[List[LabelScore]] = Field(default=None, description="All probabilities sorted by score (only included if return_all=True)")