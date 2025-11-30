# 📧 Multi-Label Email Intent Classification

[Project Link](https://github.com/Youhorng/multi-label-email-intent-classification)

[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## **Overview**
This project implements a **multi-class and multi-label email classification system**. It categorizes emails into multiple categories such as **Business, Finance, Promotions, Travel, Job Applications**, and more. The project leverages both **traditional machine learning models** and **transformer-based models** for text classification.

---

## **Features**
- Supports **multi-label classification** (emails can belong to multiple categories)  
- **Traditional ML models:** Complement Naive Bayes (CNB), Multinomial Naive Bayes (MNB), Logistic Regression (LR)  
- **Transformer models:** DistilBERT, DeBERTa-v3  
- Feature extraction using **TF-IDF Vectorization**  
- Label transformation with **MultiLabelBinarizer**  
- Evaluation using **F1 Score, Precision, Recall, and Subset Accuracy**  

---

## **Dataset**
- Emails are labeled into multiple categories  
- Each email may have one or more labels  
- Suitable for testing both **traditional ML** and **transformer-based models**

---

## **Requirements**
To run this project, install the following dependencies:

```python
dependencies = [
    "accelerate>=1.4.0",
    "datasets>=2.0.0",
    "evaluate>=0.4.0",
    "fastapi>=0.122.0",
    "gradio>=4.0.0",
    "huggingface-hub[cli]>=0.35.3",
    "ipykernel>=6.20.0",
    "ipywidgets>=8.0.0",
    "iterative-stratification>=0.1.7",
    "jupyter>=1.0.0",
    "matplotlib>=3.7.0",
    "peft>=0.10.0",
    "scikit-learn>=1.3.0",
    "seaborn>=0.12.0",
    "torch>=2.0.0",
    "tqdm>=4.65.0",
    "transformers>=4.40.0",
]
