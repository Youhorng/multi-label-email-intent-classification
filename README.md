# 📧 Multi-Class Email Classification

## **Overview**
This project classifies emails into multiple categories (**Business, Finance, Promotions, Travel, etc.**) using **traditional ML models** and **transformer-based models**. It supports **multi-label classification**, handling emails that belong to more than one category.

---

## **Features**
- Multi-class & multi-label email classification  
- **Traditional ML models:**  
  - Complement Naive Bayes (**CNB**)  
  - Multinomial Naive Bayes (**MNB**)  
  - Logistic Regression (**LR**)  
- **Transformer models:**  
  - DistilBERT  
  - DeBERTa-v3  
- **TF-IDF** feature extraction for traditional ML  
- **MultiLabelBinarizer** for label transformation  
- Evaluation metrics: **F1 Score**, **Precision**, **Recall**, **Subset Accuracy**  

---

## **Dataset**
- Emails labeled into multiple categories  
- Each email can have **more than one label**  

---

## **Installation**
```bash
# Clone repository
git clone https://github.com/yourusername/email-classification.git
cd email-classification

# Create virtual environment
python -m venv env
source env/bin/activate   # Linux/Mac
env\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt
