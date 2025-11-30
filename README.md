📧 Multi-Class Email Classification
Overview

This project classifies emails into multiple categories (Business, Finance, Promotions, Travel, etc.) using traditional ML models and transformer-based models. It supports multi-label classification to handle emails that belong to more than one category.

Features

Multi-class & multi-label email classification

Traditional ML models:

Complement Naive Bayes (CNB)

Multinomial Naive Bayes (MNB)

Logistic Regression (LR)

Transformer models:

DistilBERT

DeBERTa-v3

TF-IDF feature extraction for traditional ML

MultiLabelBinarizer for label transformation

Evaluates with F1 Score, Precision, Recall, and Subset Accuracy

Dataset

Emails labeled into multiple categories

Each email can have more than one label

Installation
# Clone repository
git clone https://github.com/yourusername/email-classification.git
cd email-classification

# Create virtual environment
python -m venv env
source env/bin/activate   # Linux/Mac
env\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

Usage
Preprocessing & Feature Extraction
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MultiLabelBinarizer

Train Traditional ML Models
from sklearn.naive_bayes import ComplementNB, MultinomialNB
from sklearn.linear_model import LogisticRegression

Train Transformer Models
from transformers import AutoTokenizer, AutoModelForSequenceClassification

Evaluate Models
from sklearn.metrics import classification_report, f1_score

Results
Model	F1 Micro	F1 Macro	Precision	Recall
DistilBERT	85%	82%	84%	86%
DeBERTa-v3-base	80%	72%	76%	84%
ComplementNB	80%	76%	80%	79%
MultinomialNB	78%	70%	86%	71%
Logistic Regression	80%	73%	85%	74%

Insights:

DistilBERT: highest F1 and recall, best at identifying relevant emails

DeBERTa-v3: good recall but slightly lower precision

ComplementNB & Logistic Regression: solid performance for traditional ML

MultinomialNB: high precision, but low recall (misses many relevant emails)

References

Hugging Face Transformers

Scikit-learn Documentation

TF-IDF Feature Extraction
