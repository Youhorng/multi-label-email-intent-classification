# 📧 Multi-Class Email Classification

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

## **Installation**
```bash
# Clone the repository
git clone https://github.com/yourusername/email-classification.git
cd email-classification

# Create and activate a virtual environment
python -m venv env
source env/bin/activate   # Linux/Mac
env\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt
